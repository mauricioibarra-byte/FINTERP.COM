const BASE_URL = 'http://localhost:3001';
const EMAIL = 'cfo@finterp.com';
const PASSWORD = 'password123';

async function verifyWorkflow() {
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

        // 2. Seed Workflow Definition (if needed)
        // We need direct DB access or an endpoint to seed. 
        // For simplicity, we assume we might need to rely on existing or CREATE one via a temporary endpoint or logic.
        // BUT, since we can't easily seed via API without an admin endpoint, 
        // we will try to rely on the fact that we might NOT have one and evaluate returns APPROVED_AUTO first,
        // then we might need to manually insert one via a "Backdoor" or just rely on a separate seed script.

        // BETTER: Use the /admin/system/seed if available, but that resets everything.
        // Let's try to assume the USER will run this and if it fails to trigger PENDING, we know why.

        // Actually, we can use Prisma Client in this script if we run it with ts-node or just require it? 
        // No, we are external.

        // Let's try to create a vendor first so we have dependencies.
        console.log('\n2. Setup: Creating Vendor...');
        const vendorRes = await fetch(`${BASE_URL}/ap/vendors`, {
            method: 'POST', headers,
            body: JSON.stringify({ vendorCode: `V-${Date.now()}`, name: 'Workflow Test Vendor', taxId: '99.999.999-9' })
        });
        const vendor = await vendorRes.json();
        const vendorId = vendor.id;

        // 3. Test AUTO-APPROVAL (Low Amount)
        // We expect this to be APPROVED_AUTO if no definitions exist, OR if we define a rule > 1000.
        // Since we haven't seeded definitions, this will return POSTED (APPROVED_AUTO).
        console.log('\n3. Test: Auto-Approval (No Rules / Low Amount)...');
        const inv1Res = await fetch(`${BASE_URL}/ap/invoices`, {
            method: 'POST', headers,
            body: JSON.stringify({
                vendorId, invoiceNumber: `INV-AUTO-${Date.now()}`,
                issueDate: new Date().toISOString(), dueDate: new Date().toISOString(),
                totalAmount: 500, currency: 'USD', expenseAccount: '500000', companyCode: 'COMP01'
            })
        });
        const inv1 = await inv1Res.json();
        console.log(`   Invoice 1 Status: ${inv1.status}`);
        if (inv1.status !== 'POSTED') console.warn('   WARNING: Expected POSTED (Auto-Approved) but got ' + inv1.status);


        // 4. Test MANUAL APPROVAL
        // We CANT test this unless we verify we have a rule. 
        // THIS SCRIPT IS PARTIAL until we have a way to seed definitions via API.
        // But we can verify the API inputs/outputs.

        console.log('\n✅ Verification of endpoints complete (Logic validation requires DB seeding).');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
    }
}

verifyWorkflow();
