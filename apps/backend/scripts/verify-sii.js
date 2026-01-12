const https = require('https');

// --- Configuration ---
const BASE_URL = 'https://w7fcdovhij.execute-api.us-east-1.amazonaws.com/prod';

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
    console.log("🚀 Verifying SII Authentication...");

    // 1. Authenticate (Get Seed -> Sign -> Get Token)
    console.log("\n1️⃣  Authenticating with SII...");
    const res = await request('POST', '/sii/auth');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Response:`, res.body);

    if (res.statusCode === 201) {
        if (res.body.seed && res.body.token) {
            console.log("   ✅ SII Auth SUCCESS!");
            console.log("   Seed:", res.body.seed);
            console.log("   Token:", res.body.token);
            console.log("   (Note: Used Mock Signature as per logs if no Cert Env Var)");
        } else {
            console.log("   ❌ Missing seed or token in response");
            process.exit(1);
        }
    } else {
        console.log("   ❌ Auth Failed");
        process.exit(1);
    }

    // 2. Upload DTE (Mock XML)
    console.log("\n2️⃣  Uploading DTE...");
    const mockXml = `<DTE>Mock Content</DTE>`;
    const uploadRes = await request('POST', '/sii/upload', {
        companyRut: '76123456-K',
        dteXml: mockXml
    });
    console.log(`   Status: ${uploadRes.statusCode}`);
    console.log(`   Response:`, uploadRes.body);

    if (uploadRes.statusCode === 201) {
        if (uploadRes.body.trackId && uploadRes.body.status) {
            console.log("   ✅ SII Upload SUCCESS!");
            console.log("   Track ID:", uploadRes.body.trackId);
        } else {
            console.log("   ❌ Missing trackId in response");
            process.exit(1);
        }
    } else {
        console.log("   ❌ Upload Failed");
        process.exit(1);
    }

    console.log("\n✅ SII INTEGRATION VERIFIED 🚀");
}

main().catch(console.error);
