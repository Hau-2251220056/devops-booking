const { PrismaClient } = require('@prisma/client');
(async () => {
    const p = new PrismaClient();
    try {
        const rows = await p.$queryRaw`SELECT id, role FROM users LIMIT 5`;
        console.log('raw rows:', rows);
    } catch (err) {
        console.error('raw select error:', err.message || err);
    } finally {
        await p.$disconnect();
    }
})();
