const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../lambda-package/node_modules');

function getSize(dir) {
    let total = 0;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fp = path.join(dir, file);
            const stat = fs.lstatSync(fp);
            if (stat.isDirectory()) {
                total += getSize(fp);
            } else {
                total += stat.size;
            }
        }
    } catch (e) { }
    return total;
}

if (!fs.existsSync(root)) {
    console.log("No node_modules found at", root);
} else {
    const dirs = fs.readdirSync(root);
    const sizes = [];
    for (const d of dirs) {
        const p = path.join(root, d);
        if (fs.lstatSync(p).isDirectory()) {
            sizes.push({ name: d, size: getSize(p) });
        }
    }

    sizes.sort((a, b) => b.size - a.size);
    console.log("TOP 20 Largest Dependencies:");
    sizes.slice(0, 20).forEach(s => {
        console.log(`${s.name}: ${(s.size / 1024 / 1024).toFixed(2)} MB`);
    });
}
