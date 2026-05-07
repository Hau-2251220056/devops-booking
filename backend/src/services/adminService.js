const prisma = require('../configs/prisma');

const getStats = async () => {
    const [totalUsers, totalBookings, pending, completed] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.booking.count({ where: { deletedAt: null } }),
        prisma.booking.count({ where: { deletedAt: null, status: 'pending' } }),
        prisma.booking.count({ where: { deletedAt: null, status: 'completed' } }),
    ]);

    return {
        totalUsers,
        totalBookings,
        pending,
        completed,
    };
};

module.exports = {
    getStats,
};