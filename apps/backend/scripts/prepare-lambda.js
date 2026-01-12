const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '../../');
const distDir = path.join(backendRoot, 'dist');
const outputDir = path.join(backendRoot, 'lambda-package');
const sharedUtilsDir = path.join(projectRoot, 'packages/shared-utils');

async function main() {
    console.log('🚀 Starting Manual Lambda Packaging...');

    // 1. Clean & Build
    console.log('🧹 Cleaning and Building Backend...');
    fs.removeSync(outputDir);
    fs.ensureDirSync(outputDir);
    execSync('npm run build', { cwd: backendRoot, stdio: 'inherit' });

    // 2. Copy compiled code
    console.log('📂 Copying dist files...');
    fs.copySync(distDir, outputDir);

    // 3. Handle Shared Utils
    console.log('📦 Packaging @finterp/shared-utils...');
    const packResult = execSync('npm pack', { cwd: sharedUtilsDir }).toString().trim();
    const tgzPath = path.join(sharedUtilsDir, packResult);
    const destTgzPath = path.join(outputDir, packResult);
    fs.moveSync(tgzPath, destTgzPath);

    // 4. Prepare package.json
    console.log('📝 Updating package.json for production...');
    const pkg = require(path.join(backendRoot, 'package.json'));
    pkg.dependencies['@finterp/shared-utils'] = `file:./${packResult}`;
    delete pkg.scripts;
    delete pkg.devDependencies;
    fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(pkg, null, 2));

    // 5. Install Production Dependencies
    console.log('⬇️  Installing production dependencies...');
    execSync('npm install --omit=dev --no-bin-links', { cwd: outputDir, stdio: 'inherit' });

    // 6. Generate & Copy Prisma Client
    console.log('⚙️  Generating Prisma Client (in root)...');
    execSync('npx prisma generate', { cwd: backendRoot, stdio: 'inherit' });

    console.log('💎 Copying generated Prisma artifacts...');
    const sourcePrismaClient = path.join(backendRoot, 'node_modules/.prisma');
    const destPrismaClient = path.join(outputDir, 'node_modules/.prisma');

    // Ensure we copy recursively
    fs.ensureDirSync(path.dirname(destPrismaClient));
    fs.copySync(sourcePrismaClient, destPrismaClient);
    console.log('   ✅ Copied .prisma client artifacts');

    fs.copySync(
        path.join(backendRoot, 'prisma/schema.prisma'),
        path.join(outputDir, 'schema.prisma')
    );

    // 7. Copy Bootstrap
    fs.copySync(
        path.join(backendRoot, 'src/bootstrap.js'),
        path.join(outputDir, 'bootstrap.js')
    );

    // 8. Download Missing Schema Engine for RHEL (Needed for Migration)
    console.log('🌍 Fetching RHEL Schema Engine...');
    try {
        const vOutput = execSync('npx prisma version', { cwd: backendRoot }).toString();
        // Look for the commit (40 chars hex)
        const commit = /[a-f0-9]{40}/.exec(vOutput)?.[0];

        if (commit) {
            console.log(`   Detailed Commit Hash: ${commit}`);
            // Download schema-engine
            const engineUrl = `https://binaries.prisma.sh/all_commits/${commit}/rhel-openssl-3.0.x/schema-engine.gz`;
            const engineDir = path.join(outputDir, 'node_modules/@prisma/engines');
            fs.ensureDirSync(engineDir);

            const dest = path.join(engineDir, 'schema-engine-rhel-openssl-3.0.x.gz');
            const finalDest = path.join(engineDir, 'schema-engine-rhel-openssl-3.0.x');

            console.log(`   Downloading from ${engineUrl}...`);
            // Use curl (available in git bash / most environments)
            execSync(`curl -L -o "${dest}" "${engineUrl}"`);

            console.log(`   Unzipping...`);
            const zlib = require('zlib');
            const gzContent = fs.readFileSync(dest);
            const unzipped = zlib.gunzipSync(gzContent);
            fs.writeFileSync(finalDest, unzipped);

            // Set executable
            fs.chmodSync(finalDest, '755');
            fs.unlinkSync(dest); // Remove .gz

            console.log(`   ✅ Downloaded and unzipped schema-engine to ${finalDest}`);
        } else {
            console.warn("   ⚠️ Could not determine Prisma Commit Hash. Skipping Schema Engine download.");
        }
    } catch (e) {
        console.error("   ❌ Failed to download engine:", e.message);
    }

    // 8b. Copy Query Engine if missing (from root or @prisma)
    const binaryName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
    const sourceBinary = path.join(backendRoot, 'node_modules/prisma', binaryName);
    const destBinary = path.join(outputDir, binaryName);

    if (!fs.existsSync(destBinary)) {
        if (fs.existsSync(sourceBinary)) {
            fs.copySync(sourceBinary, destBinary);
            fs.chmodSync(destBinary, '755');
        } else {
            // Check .prisma/client (it might be there from copy)
            const alt = path.join(outputDir, 'node_modules/.prisma/client', binaryName);
            if (fs.existsSync(alt)) {
                fs.copySync(alt, destBinary);
                fs.chmodSync(destBinary, '755');
            } else {
                // Try @prisma/engines
                const alt2 = path.join(outputDir, 'node_modules/@prisma/engines', binaryName);
                if (fs.existsSync(alt2)) {
                    fs.copySync(alt2, destBinary);
                    fs.chmodSync(destBinary, '755');
                }
            }
        }
    }


    // 9. Prune Unnecessary Files (LAST STEP)
    // IMPORTANT: check files CAREFULLY to not delete what we just downloaded
    console.log("✂️  Pruning Unnecessary Files...");
    const { readdirSync, lstatSync, unlinkSync, rmSync, existsSync } = require('fs');

    // 1. Remove .cache
    const cacheDir = path.join(outputDir, 'node_modules', '.cache');
    if (existsSync(cacheDir)) rmSync(cacheDir, { recursive: true, force: true });

    // 2. Remove aws-sdk
    const awsDistDir = path.join(outputDir, 'node_modules', 'aws-sdk', 'dist');
    if (existsSync(awsDistDir)) rmSync(awsDistDir, { recursive: true, force: true });

    // Prune aws-sdk clients
    const awsClientsDir = path.join(outputDir, 'node_modules', 'aws-sdk', 'clients');
    if (existsSync(awsClientsDir)) {
        const keepClients = ['s3', 'dynamodb', 'secretsmanager', 'ssm', 'kms', 'sts', 'lambda', 'cloudwatch', 'eventbridge', 'sns', 'sqs'];
        const clientFiles = readdirSync(awsClientsDir);
        for (const file of clientFiles) {
            let keep = false;
            if (file === 'index.js' || file === 'index.d.ts' || file === 'all.js' || file === 'all.d.ts') keep = true;
            else {
                for (const k of keepClients) {
                    if (file.toLowerCase().startsWith(k)) { keep = true; break; }
                }
            }
            if (!keep) {
                const fp = path.join(awsClientsDir, file);
                try { if (lstatSync(fp).isDirectory()) rmSync(fp, { recursive: true, force: true }); else unlinkSync(fp); } catch (e) { }
            }
        }
    }

    // 3. Prune Engines
    const prunePaths = [
        path.join(outputDir, 'node_modules', '@prisma', 'engines'),
        path.join(outputDir, 'node_modules', 'prisma', 'node_modules', '@prisma', 'engines'),
        path.join(outputDir, 'node_modules', '.prisma', 'client'),
    ];

    function deleteUnusedEngines(dirVal) {
        if (!existsSync(dirVal)) return;
        const files = readdirSync(dirVal);
        for (const file of files) {
            const fullPath = path.join(dirVal, file);

            // CRITICAL: KEEP rhel-openssl-3.0.x
            // Also keep "schema-engine-rhel-openssl-3.0.x" which we just downloaded
            if (file.includes('rhel-openssl-3.0.x')) continue;

            if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.d.ts') || file === 'dist' || file === 'scripts') continue;

            if (file.includes('windows') || file.includes('darwin') || file.includes('debian') || file.includes('musl')) {
                console.log(`   Deleting Engine: ${file}`);
                try { if (lstatSync(fullPath).isDirectory()) rmSync(fullPath, { recursive: true, force: true }); else unlinkSync(fullPath); } catch (e) { }
            }
            else if (file.includes('introspection') || file.includes('fmt') || file.includes('format')) {
                try { unlinkSync(fullPath); } catch (e) { }
            }
        }
    }
    prunePaths.forEach(deleteUnusedEngines);

    console.log('✅ Lambda Package Ready at:', outputDir);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
