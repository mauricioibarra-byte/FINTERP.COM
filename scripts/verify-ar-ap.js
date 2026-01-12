const BASE_URL = 'http://localhost:3001';
const EMAIL = 'cfo@finterp.com'; // Standard seed user
const PASSWORD = 'password123';

async function verifyArAp() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        console.log('   Success! Token received.');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // --- AR Flow ---
        console.log('\n2. Testing AR (Accounts Receivable)...');
        console.log('   Creating Customer...');
        const customerRes = await fetch(`${BASE_URL}/ar/customers`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                customerCode: `CUST-${Date.now()}`,
                name: 'Verification Customer Ltd',
                taxId: '77.777.777-7'
            })
        });
        if (!customerRes.ok) throw new Error(`Create Customer failed: ${customerRes.statusText}`);
        const customerData = await customerRes.json();
        const customerId = customerData.id;
        console.log(`   Customer created: ${customerId}`);

        console.log('   Creating Sales Invoice...');
        const salesInvRes = await fetch(`${BASE_URL}/ar/invoices`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                customerId: customerId,
                invoiceNumber: `SINV-${Date.now()}`,
                issueDate: new Date().toISOString(),
                dueDate: new Date().toISOString(),
                totalAmount: 1500.00,
                currency: 'USD',
                revenueAccount: '400000',
                companyCode: 'COMP01'
            })
        });
        if (!salesInvRes.ok) throw new Error(`Create Sales Invoice failed: ${salesInvRes.statusText}`);
        const salesInvData = await salesInvRes.json();
        console.log(`   Sales Invoice created: ${salesInvData.id}`);


        // --- AP Flow ---
        console.log('\n3. Testing AP (Accounts Payable)...');
        console.log('   Creating Vendor...');
        const vendorRes = await fetch(`${BASE_URL}/ap/vendors`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                vendorCode: `VEND-${Date.now()}`,
                name: 'Verification Vendor Inc',
                taxId: '88.888.888-8'
            })
        });
        if (!vendorRes.ok) throw new Error(`Create Vendor failed: ${vendorRes.statusText} - ${await vendorRes.text()}`);
        const vendorData = await vendorRes.json();
        const vendorId = vendorData.id;
        console.log(`   Vendor created: ${vendorId}`);

        console.log('   Creating Purchase Invoice...');
        const purchInvRes = await fetch(`${BASE_URL}/ap/invoices`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                vendorId: vendorId,
                invoiceNumber: `PINV-${Date.now()}`,
                issueDate: new Date().toISOString(),
                dueDate: new Date().toISOString(),
                totalAmount: 850.50,
                currency: 'USD',
                expenseAccount: '500000',
                companyCode: 'COMP01'
            })
        });
        if (!purchInvRes.ok) throw new Error(`Create Purchase Invoice failed: ${purchInvRes.statusText}`);
        const purchInvData = await purchInvRes.json();
        console.log(`   Purchase Invoice created: ${purchInvData.id}`);

        console.log('\n✅ Verification Complete: AR and AP flows working correctly.');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

verifyArAp();
