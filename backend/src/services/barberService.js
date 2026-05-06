const bcrypt = require('bcryptjs');
const prisma = require('../configs/prisma');
const ApiError = require('../utils/ApiError');
const { sanitizeUser } = require('./authService');

const serializeBarber = (barber) => ({
    id: barber.id,
    branchId: barber.branchId,
    userId: barber.userId,
    specialization: barber.specialization,
    experienceYears: barber.experienceYears,
    rating: Number(barber.rating),
    totalBookings: barber.totalBookings,
    bio: barber.bio,
    avatarUrl: barber.avatarUrl,
    isActive: barber.isActive,
    isAvailable: barber.isAvailable,
    createdAt: barber.createdAt,
    updatedAt: barber.updatedAt,
    branch: barber.branch,
    user: barber.user ? sanitizeUser(barber.user) : null,
});

const list = async ({ includeInactive = false } = {}) => {
    const barbers = await prisma.barber.findMany({
        where: includeInactive ? {} : { isActive: true, deletedAt: null },
        include: {
            branch: true,
            user: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return barbers.map(serializeBarber);
};

const getById = async (id) => {
    const barber = await prisma.barber.findFirst({
        where: { id, deletedAt: null },
        include: { branch: true, user: true },
    });

    if (!barber) {
        throw new ApiError(404, 'Barber not found');
    }

    return serializeBarber(barber);
};

const create = async (payload) => {
    const branch = await prisma.branch.findFirst({
        where: { id: payload.branchId, deletedAt: null },
    });

    if (!branch) {
        throw new ApiError(404, 'Branch not found');
    }

    const existing = await prisma.user.findFirst({
        where: {
            OR: [{ username: payload.username }, { email: payload.email }],
        },
    });

    if (existing) {
        throw new ApiError(409, 'Username or email already exists');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                username: payload.username,
                email: payload.email,
                passwordHash,
                firstName: payload.firstName,
                lastName: payload.lastName,
                phone: payload.phone,
                role: 'staff',
                isActive: payload.isActive ?? true,
                isVerified: true,
            },
        });

        return tx.barber.create({
            data: {
                branchId: payload.branchId,
                userId: user.id,
                specialization: payload.specialization,
                experienceYears: payload.experienceYears,
                bio: payload.bio,
                isActive: payload.isActive ?? true,
                isAvailable: payload.isAvailable ?? true,
            },
            include: {
                branch: true,
                user: true,
            },
        });
    });

    return serializeBarber(result);
};

const update = async (id, payload) => {
    const barber = await prisma.barber.findFirst({
        where: { id, deletedAt: null },
        include: { user: true },
    });

    if (!barber) {
        throw new ApiError(404, 'Barber not found');
    }

    if (payload.branchId) {
        const branch = await prisma.branch.findFirst({
            where: { id: payload.branchId, deletedAt: null },
        });

        if (!branch) {
            throw new ApiError(404, 'Branch not found');
        }
    }

    const existingUser =
    payload.username || payload.email
        ? await prisma.user.findFirst({
            where: {
                id: { not: barber.userId },
                OR: [
                    payload.username ? { username: payload.username } : undefined,
                    payload.email ? { email: payload.email } : undefined,
                ].filter(Boolean),
            },
        })
        : null;

    if (existingUser) {
        throw new ApiError(409, 'Username or email already exists');
    }

    const updated = await prisma.$transaction(async (tx) => {
        if (
            payload.username ||
      payload.email ||
      payload.password ||
      payload.firstName !== undefined ||
      payload.lastName !== undefined ||
      payload.phone !== undefined ||
      payload.isActive !== undefined
        ) {
            const userData = {};

            if (payload.username !== undefined) userData.username = payload.username;
            if (payload.email !== undefined) userData.email = payload.email;
            if (payload.password !== undefined)
                userData.passwordHash = await bcrypt.hash(payload.password, 10);
            if (payload.firstName !== undefined)
                userData.firstName = payload.firstName;
            if (payload.lastName !== undefined) userData.lastName = payload.lastName;
            if (payload.phone !== undefined) userData.phone = payload.phone;
            if (payload.isActive !== undefined) userData.isActive = payload.isActive;

            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: barber.userId },
                    data: userData,
                });
            }
        }

        return tx.barber.update({
            where: { id },
            data: {
                branchId: payload.branchId,
                specialization: payload.specialization,
                experienceYears: payload.experienceYears,
                bio: payload.bio,
                isActive: payload.isActive,
                isAvailable: payload.isAvailable,
            },
            include: {
                branch: true,
                user: true,
            },
        });
    });

    return serializeBarber(updated);
};

const remove = async (id) => {
    const barber = await prisma.barber.findFirst({
        where: { id, deletedAt: null },
    });

    if (!barber) {
        throw new ApiError(404, 'Barber not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: barber.userId },
            data: { isActive: false },
        });

        return tx.barber.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
                isAvailable: false,
            },
            include: {
                branch: true,
                user: true,
            },
        });
    });

    return serializeBarber(updated);
};

module.exports = {
    list,
    getById,
    create,
    update,
    remove,
    serializeBarber,
};
