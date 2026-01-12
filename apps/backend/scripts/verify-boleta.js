const https = require('https');

// --- Configuration ---
// Note: In a real scenario, we'd log in dynamically. 
// For this quick script, we'll assume we can get a valid token or just hit endpoints if they are public?
// No, endpoints are likely protected. `SiiController` endpoints did NOT have `@UseGuards(JwtAuthGuard)` explicitly in my snippet view, 
// EXCEPT `generateDte` which has `@UseGuards(DteLimitGuard)`.
// `uploadDte` and `rcof` likely didn't have guards shown in snippet but usually should.
// However, `SiiController` is at root. Let's assume we need auth.
// I'll copy the login flow from bootstrap-db.js if needed, or better, just try to hit them.
// Wait, `generateDte` definitely needs it.
// I will just use the `bootstrap-db.js` logic to get a token first.

const BASE_URL = 'https://w7fcdovhij.execute-api.us-east-1.amazonaws.com/prod';
let TOKEN = '';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    console.error("Failed to parse:", data);
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log("🚀 Verifying Boleta (Type 39) & RCOF...");

    // 1. Login (using the admin user created in bootstrap)
    console.log("\n1️⃣  Logging in...");
    const loginRes = await request('POST', '/auth/login', {
        email: 'admin@finterp.com',
        password: 'Password123!'
    });

    if (loginRes.statusCode === 201 || loginRes.statusCode === 200) {
        TOKEN = loginRes.body.access_token;
        console.log("   ✅ Logged in.");
    } else {
        console.log("   ❌ Login Failed. Ensure bootstrap-db.js was run.");
        console.log("   Response:", loginRes.body);
        process.exit(1);
    }

    // 1.5 Upload CAF for Type 39
    console.log("\n1️⃣.5️⃣  Uploading CAF for Type 39...");
    const startRange = 1000 + Math.floor(Math.random() * 5000);
    const cafData = {
        dteType: 39,
        filename: 'caf_39.xml',
        xmlContent: '<CAF>...</CAF>', // Mock content
        startRange: startRange,
        endRange: startRange + 100
    };
    const cafRes = await request('POST', '/sii/caf', cafData, TOKEN);
    console.log(`   Status: ${cafRes.statusCode}`);

    // 2. Create Customer
    console.log("\n2️⃣  Creating Customer...");
    const rand = Math.floor(Math.random() * 1000);
    const cusData = {
        customerCode: `CUS-${rand}`,
        name: `Test Customer ${rand}`,
        taxId: '66666666-6'
    };
    const cusRes = await request('POST', '/ar/customers', cusData, TOKEN);
    console.log(`   Status: ${cusRes.statusCode}`);
    if (cusRes.statusCode >= 400 && String(cusRes.statusCode) !== '409') { // 409 conflict is ok (exists)
        console.log("   ❌ Customer Creation Failed", cusRes.body);
        process.exit(1);
    }
    const customerId = cusRes.body.id || (await request('GET', '/ar/customers', null, TOKEN)).body[0]?.id; // If conflict, find one? No GET endpoint?
    // If we assume success:

    // 2.5 Seed GL Accounts (Required for Invoice)
    console.log("\n2️⃣.5️⃣  Seeding GL Accounts...");
    const gl1 = await request('POST', '/finance/gl-accounts', { accountCode: '110000', description: 'Accounts Receivable', accountType: 'ASSET' }, TOKEN);
    const gl2 = await request('POST', '/finance/gl-accounts', { accountCode: '410000', description: 'Sales Revenue', accountType: 'REVENUE' }, TOKEN);

    if (gl1.statusCode >= 400 || gl2.statusCode >= 400) {
        console.log("   ⚠️ GL Account seeding failed/warn (might exist). Continuing...");
        console.log("   GL1:", gl1.statusCode, "GL2:", gl2.statusCode);
    } else {
        console.log("   ✅ GL Accounts Seeded.");
    }

    // 3. Create Invoice
    console.log("\n3️⃣  Creating Invoice...");
    const invData = {
        customerId: customerId, // Might be undefined if failed/conflict and no get endpoint.
        // We rely on successful creation for this test.
        invoiceNumber: `INV-${rand}`,
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        totalAmount: 1000,
        currency: 'CLP',
        revenueAccount: '410000'
    };
    const invRes = await request('POST', '/ar/invoices', invData, TOKEN);
    console.log(`   Status: ${invRes.statusCode}`);
    if (invRes.statusCode >= 400) {
        console.log("   ❌ Invoice Creation Failed", invRes.body);
        process.exit(1);
    }
    const invoiceId = invRes.body.id;
    console.log(`   ✅ Invoice Created: ${invoiceId}`);

    // 4. Generate Boleta (Type 39)
    console.log("\n4️⃣  Generating Boleta (Type 39)...");
    const dteRes = await request('POST', `/sii/dte/generate/${invoiceId}`, { type: 39 }, TOKEN);
    console.log(`   Status: ${dteRes.statusCode}`);

    if (dteRes.statusCode >= 400) {
        console.log("   ❌ Boleta Generation Failed");
        console.log("   Response:", dteRes.body);
        process.exit(1);
    }

    if (dteRes.statusCode === 201 || dteRes.statusCode === 200) {
        console.log("   ✅ Boleta Generated!");
        console.log("   Folio:", dteRes.body.folio);
        console.log("   Type:", dteRes.body.dteType);
    } else {
        console.log("   ❌ Boleta Generation Failed");
        console.log("   Response:", dteRes.body);
    }

    // 5. Generate RCOF
    console.log("\n5️⃣  Generating RCOF (Daily Summary)...");
    const today = new Date().toISOString().split('T')[0];
    const rcofRes = await request('POST', '/sii/rcof', { date: today }, TOKEN);

    console.log(`   Status: ${rcofRes.statusCode}`);
    console.log(`   Response:`, rcofRes.body);

    if (rcofRes.statusCode === 201 || rcofRes.statusCode === 200) {
        console.log("   ✅ RCOF Generated!");
        console.log("   XML (Snippet):", rcofRes.body.xml ? rcofRes.body.xml.substring(0, 100) + "..." : "No XML");
    } else {
        console.log("   ❌ RCOF Failed");
    }
}

main().catch(console.error);
