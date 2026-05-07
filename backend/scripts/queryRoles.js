const { PrismaClient } = require('@prisma/client');
(async () => {
    const p = new PrismaClient();
    try {
        const rows = await p.$queryRaw`SELECT DISTINCT role FROM users`;
        console.log('Distinct roles in DB:', rows);
    } catch (err) {
        console.error('Error querying roles:', err.message || err);
    } finally {
        await p.$disconnect();
    }
})();
