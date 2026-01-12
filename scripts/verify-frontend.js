const fetch = require('node-fetch');

(async () => {
    try {
        const res = await fetch('http://localhost:3000');
        if (res.ok) {
            console.log('✅ Frontend is running on http://localhost:3000');
            process.exit(0);
        } else {
            console.error('❌ Frontend returned status:', res.status);
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Frontend unreachable:', e.message);
        process.exit(1);
    }
})();
