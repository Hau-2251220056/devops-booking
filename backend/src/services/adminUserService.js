const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

const serializeUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
});

const buildSearchWhere = (q) => {
    const term = (q || "").trim();

    if (!term) {
        return { deletedAt: null };
    }

    return {
        deletedAt: null,
        OR: [
            { username: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
        ],
    };
};

const listUsers = async ({ q = "", page = 1, limit = 10 } = {}) => {
    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const where = buildSearchWhere(q);
    const skip = (currentPage - 1) * currentLimit;

    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: currentLimit,
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        }),
    ]);

    return {
        users: users.map(serializeUser),
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / currentLimit),
    };
};

const updateUser = async (id, payload = {}) => {
    const existingUser = await prisma.user.findFirst({
        where: { id, deletedAt: null },
    });

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    const data = {};
    if (payload.role !== undefined) {
        data.role = payload.role;
    }
    if (payload.isActive !== undefined) {
        data.isActive = payload.isActive;
    }
    if (payload.firstName !== undefined) {
        data.firstName = payload.firstName;
    }
    if (payload.lastName !== undefined) {
        data.lastName = payload.lastName;
    }
    if (payload.phone !== undefined) {
        data.phone = payload.phone;
    }

    if (Object.keys(data).length === 0) {
        throw new ApiError(400, "At least one field is required");
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    return serializeUser(updatedUser);
};

const deleteUser = async (id, currentUserId) => {
    if (id === currentUserId) {
        throw new ApiError(400, "You cannot delete your own account");
    }

    const existingUser = await prisma.user.findFirst({
        where: { id, deletedAt: null },
    });

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    const deletedUser = await prisma.user.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            isActive: false,
        },
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    return serializeUser(deletedUser);
};

const createUser = async (payload = {}) => {
    const username = (payload.username || "").trim();
    const email = (payload.email || "").trim().toLowerCase();

    if (!username || !email) {
        throw new ApiError(400, "Username and email are required");
    }

    const existing = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }],
        },
    });

    if (existing) {
        throw new ApiError(400, "Username or email already exists");
    }

    const rawPassword = payload.password || "password123";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const created = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            firstName: payload.firstName || null,
            lastName: payload.lastName || null,
            phone: payload.phone || null,
            role: payload.role || "customer",
            isActive: payload.isActive === undefined ? true : Boolean(payload.isActive),
            isVerified: false,
        },
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    return serializeUser(created);
};

module.exports = {
    listUsers,
    updateUser,
    deleteUser,
    createUser,
    serializeUser,
};