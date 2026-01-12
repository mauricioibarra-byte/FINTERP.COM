const { execSync } = require('child_process');

try {
    // Find the function name - hardcoded for now based on previous logs, or better, query it.
    // FintERP-Api-FintERPBackend797C9E26-hjEodFU0XuO3
    const functionName = "FintERP-Api-FintERPBackend797C9E26-hjEodFU0XuO3";

    console.log(`Invoking ${functionName}...`);
    const output = execSync(`aws lambda invoke --function-name ${functionName} --payload "e30=" --log-type Tail response.json`, { encoding: 'utf8' });

    const json = JSON.parse(output);
    if (json.LogResult) {
        console.log("--- LAMBDA LOGS ---");
        console.log(Buffer.from(json.LogResult, 'base64').toString('utf8'));
        console.log("-------------------");
    }
} catch (e) {
    console.error("Error invoking:", e.message);
}
