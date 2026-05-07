const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../configs/prisma');
const ApiError = require('../utils/ApiError');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (secret) {
        return secret;
    }

    if (process.env.NODE_ENV === 'production') {
        throw new ApiError(500, 'JWT_SECRET is required in production');
    }

    return 'booking-system-dev-secret';
};

const tokenPayload = (user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
});

const signToken = (user) => {
    return jwt.sign(tokenPayload(user), getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

const sanitizeUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const register = async (payload) => {
    const { username, email, password, firstName, lastName, phone } = payload;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }],
        },
    });

    if (existingUser) {
        throw new ApiError(409, 'Username or email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            role: 'customer',
            isActive: true,
            isVerified: true,
        },
    });

    const token = signToken(user);

    return {
        token,
        user: sanitizeUser(user),
    };
};

const login = async ({ identifier, password }) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
    });

    if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        throw new ApiError(401, 'Invalid credentials');
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    const token = signToken(updatedUser);

    return {
        token,
        user: sanitizeUser(updatedUser),
    };
};

const profile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            barber: {
                include: {
                    branch: true,
                },
            },
        },
    });

    if (!user || !user.isActive) {
        throw new ApiError(404, 'User not found');
    }

    return {
        ...sanitizeUser(user),
        barber: user.barber
            ? {
                id: user.barber.id,
                branchId: user.barber.branchId,
                specialization: user.barber.specialization,
                experienceYears: user.barber.experienceYears,
                rating: Number(user.barber.rating),
                totalBookings: user.barber.totalBookings,
                bio: user.barber.bio,
                avatarUrl: user.barber.avatarUrl,
                isActive: user.barber.isActive,
                isAvailable: user.barber.isAvailable,
                branch: user.barber.branch,
            }
            : null,
    };
};

module.exports = {
    register,
    login,
    profile,
    sanitizeUser,
    signToken,
};
