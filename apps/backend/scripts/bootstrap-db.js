const https = require('https');

// --- Configuration ---
const BASE_URL = 'https://w7fcdovhij.execute-api.us-east-1.amazonaws.com/prod';
const TENANT_DATA = {
    name: "FintERP Demo Tenant",
    email: "admin@finterp.com",
    planCode: "ENTERPRISE"
};
const USER_DATA = {
    email: "admin@finterp.com",
    password: "Password123!",
    fullName: "System Admin"
};

// --- Helpers ---
function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
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
    console.log("🚀 Starting Full System Bootstrap & Verification...");

    // 1. Seed Plans
    console.log("\n1️⃣  Seeding System Plans...");
    const seedRes = await request('POST', '/admin/system/seed');
    console.log(`   Status: ${seedRes.statusCode}`);
    console.log(`   Response:`, seedRes.body);
    if (seedRes.statusCode >= 400) process.exit(1);

    // 2. Create Tenant
    console.log("\n2️⃣  Creating Tenant...");
    const tenantRes = await request('POST', '/admin/tenants', TENANT_DATA);
    console.log(`   Status: ${tenantRes.statusCode}`);
    console.log(`   Response:`, tenantRes.body);
    if (tenantRes.statusCode >= 400) process.exit(1);

    const tenantId = tenantRes.body.id;
    console.log(`   ✅ Tenant ID: ${tenantId}`);

    // 3. Register Admin User
    console.log("\n3️⃣  Registering Admin User...");
    const regData = { ...USER_DATA, tenantId: tenantId };
    const regRes = await request('POST', '/auth/register', regData);
    console.log(`   Status: ${regRes.statusCode}`);
    console.log(`   Response:`, regRes.body);
    // 201 Created or 200 OK
    if (regRes.statusCode >= 400) process.exit(1);

    // 4. Verification Login
    console.log("\n4️⃣  Verifying Login...");
    const loginRes = await request('POST', '/auth/login', {
        email: USER_DATA.email,
        password: USER_DATA.password
    });
    console.log(`   Status: ${loginRes.statusCode}`);

    if (loginRes.statusCode === 200 || loginRes.statusCode === 201) {
        console.log("   ✅ Login SUCCESS!");
        console.log("   Token:", loginRes.body.access_token ? "Yes (Hidden)" : "Missing");
    } else {
        console.log("   ❌ Login FAILED");
        console.log("   Body:", loginRes.body);
        process.exit(1);
    }

    console.log("\n✅ SYSTEM FULLY OPERATIONAL 🚀");
}

main().catch(console.error);
