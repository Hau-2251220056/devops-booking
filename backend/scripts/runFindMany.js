const { PrismaClient } = require('@prisma/client');
(async () => {
    const p = new PrismaClient();
    try {
        const where = { deletedAt: null };
        const users = await p.user.findMany({ where, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, role: true, email: true } });
        console.log('Fetched users:', users.slice(0, 5));
    } catch (err) {
        console.error('findMany error:', err.message);
    } finally {
        await p.$disconnect();
    }
})();
