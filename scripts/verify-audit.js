const BASE_URL = 'http://localhost:3001';
const EMAIL = 'cfo@finterp.com';
const PASSWORD = 'password123';

async function verifyAuditTrail() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const { access_token: token } = await loginRes.json();
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        console.log('   Success! Token received.');

        // 2. Create Vendor
        console.log('\n2. Setup: Creating Vendor...');
        const vendorRes = await fetch(`${BASE_URL}/ap/vendors`, {
            method: 'POST', headers,
            body: JSON.stringify({ vendorCode: `V-AUDIT-${Date.now()}`, name: 'Audit Test Vendor', taxId: '88.888.888-8' })
        });
        const vendor = await vendorRes.json();
        const vendorId = vendor.id;

        // 3. Create Invoice (Logs CREATE)
        console.log('\n3. Action: Creating Invoice (Should log CREATE)...');
        const invRes = await fetch(`${BASE_URL}/ap/invoices`, {
            method: 'POST', headers,
            body: JSON.stringify({
                vendorId, invoiceNumber: `INV-AUDIT-${Date.now()}`,
                issueDate: new Date().toISOString(), dueDate: new Date().toISOString(),
                totalAmount: 12000, currency: 'USD', expenseAccount: '500000', companyCode: 'COMP01'
            })
        });
        const inv = await invRes.json();
        console.log(`   Invoice Created. Status: ${inv.status}, ID: ${inv.id}`);

        // 4. Check Audit Log
        console.log('\n4. Validation: Checking Audit Log for CREATE...');
        await new Promise(r => setTimeout(r, 1000)); // Wait for async log
        const logsRes = await fetch(`${BASE_URL}/audit?entityId=${inv.id}&entityType=PURCHASE_INVOICE`, { headers });
        const logs = await logsRes.json();

        const createLog = logs.find(l => l.action === 'CREATE');
        if (createLog) {
            console.log('   ✅ CREATE Log found:', createLog.id);
        } else {
            console.error('   ❌ CREATE Log NOT found!');
        }

        console.log('\n✅ Audit Verification Complete (Partial).');
        // Note: Full verification would involve approving workflow and checking UPDATE log.

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
    }
}

verifyAuditTrail();
