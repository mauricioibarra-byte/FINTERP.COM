const { execSync } = require('child_process');
const https = require('https');

try {
    console.log("🔍 Fetching API Endpoint...");
    const cmd = `aws cloudformation describe-stacks --stack-name FintERP-Api --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text`;
    const apiUrl = execSync(cmd).toString().trim();

    if (!apiUrl) {
        throw new Error("Could not find API Endpoint in CloudFormation outputs");
    }

    console.log(`✅ API Endpoint: ${apiUrl}`);
    const migrateUrl = `${apiUrl}admin/system/migrate`;
    console.log(`🚀 Invoking: ${migrateUrl}`);

    const req = https.request(migrateUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 30000 // 30s timeout
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`\n📢 Status Code: ${res.statusCode}`);
            console.log("📄 Response Body:");
            console.log(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log("✅ Migration Invocation SUCCESS");
            } else {
                console.error("❌ Migration Invocation FAILED");
                process.exit(1);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Request Error: ${e.message}`);
        process.exit(1);
    });

    req.end();

} catch (e) {
    console.error("❌ Error:", e.message);
    process.exit(1);
}
