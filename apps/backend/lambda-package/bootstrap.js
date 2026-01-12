const fs = require('fs');
const path = require('path');

console.log("🚀 [BOOTSTRAP] Starting Binary Relocation (v6 - Final)...");

function bootstrap() {
    const binaryName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
    const sourcePath = path.join(__dirname, binaryName);
    const destPath = path.join('/tmp', binaryName);

    // Check Source
    if (!fs.existsSync(sourcePath)) {
        console.error("   ❌ CRITICAL: Source binary NOT FOUND at " + sourcePath);
        return;
    }
    const srcStats = fs.statSync(sourcePath);

    let performCopy = true;

    // Check Dest (Warm Start Candidates)
    if (fs.existsSync(destPath)) {
        const destStats = fs.statSync(destPath);

        if (destStats.size === srcStats.size) {
            try {
                fs.accessSync(destPath, fs.constants.X_OK);
                // Binary is good.
                performCopy = false;
            } catch (e) {
                console.log("   ⚠️ Binary exists but perms wrong. Re-chmodding...");
                performCopy = false; // We will just chmod below
                try {
                    fs.chmodSync(destPath, 0o755);
                } catch (err) {
                    performCopy = true;
                }
            }
        } else {
            console.log("   ⚠️ Binary exists but SIZE MISMATCH. Overwriting...");
            try {
                fs.unlinkSync(destPath);
            } catch (e) { }
            performCopy = true;
        }
    }

    if (performCopy) {
        try {
            console.log("   ❄️ Cold Start / Repair: Copying binary...");
            fs.copyFileSync(sourcePath, destPath);
            fs.chmodSync(destPath, 0o755);
            console.log("   ✅ Copy successful & Permissions set");
        } catch (err) {
            console.error("   ❌ Bootstrap Failed:", err);
        }
    }

    process.env.PRISMA_QUERY_ENGINE_LIBRARY = destPath;
    // console.log(`   ✅ ENV SET: ${process.env.PRISMA_QUERY_ENGINE_LIBRARY}`);
}

bootstrap();
