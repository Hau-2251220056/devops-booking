const { PrismaClient } = require('@prisma/client');
(async () => {
    const p = new PrismaClient();
    try {
        const r = await p.$queryRaw`SELECT enum_range(NULL::"UserRole")`;
        console.log('enum_range:', r);
    } catch (err) {
        console.error('enum_range error:', err.message || err);
    } finally {
        await p.$disconnect();
    }
})();
