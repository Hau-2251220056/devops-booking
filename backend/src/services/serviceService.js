const prisma = require('../configs/prisma');
const ApiError = require('../utils/ApiError');

const serializeService = (service) => ({
    id: service.id,
    branchId: service.branchId,
    name: service.name,
    description: service.description,
    price: service.price?.toString?.() ?? String(service.price),
    durationMinutes: service.durationMinutes,
    category: service.category,
    imageUrl: service.imageUrl,
    isActive: service.isActive,
    orderIndex: service.orderIndex,
    branch: service.branch || undefined,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
});

const list = async ({ includeInactive = false } = {}) => {
    const services = await prisma.service.findMany({
        where: includeInactive ? {} : { isActive: true, deletedAt: null },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
            branch: true,
        },
    });

    return services.map(serializeService);
};

const getById = async (id) => {
    const service = await prisma.service.findFirst({
        where: { id, deletedAt: null },
        include: { branch: true },
    });

    if (!service) {
        throw new ApiError(404, 'Service not found');
    }

    return serializeService(service);
};

const create = async (payload) => {
    let branchId = payload.branchId;

    // If branchId not provided, use first active branch
    if (!branchId) {
        const firstBranch = await prisma.branch.findFirst({
            where: { isActive: true, deletedAt: null },
            orderBy: { name: 'asc' },
        });

        if (!firstBranch) {
            throw new ApiError(400, 'No active branches available');
        }

        branchId = firstBranch.id;
    } else {
        // Verify branch exists if branchId provided
        const branch = await prisma.branch.findFirst({
            where: { id: branchId, deletedAt: null },
        });

        if (!branch) {
            throw new ApiError(404, 'Branch not found');
        }
    }

    const service = await prisma.service.create({
        data: {
            branchId,
            name: payload.name,
            description: payload.description,
            price: payload.price,
            durationMinutes: payload.durationMinutes,
            category: payload.category,
            imageUrl: payload.imageUrl,
            isActive: payload.isActive ?? true,
            orderIndex: payload.orderIndex ?? 0,
        },
        include: { branch: true },
    });

    return serializeService(service);
};

const update = async (id, payload) => {
    const service = await prisma.service.findFirst({
        where: { id, deletedAt: null },
    });

    if (!service) {
        throw new ApiError(404, 'Service not found');
    }

    if (payload.branchId) {
        const branch = await prisma.branch.findFirst({
            where: { id: payload.branchId, deletedAt: null },
        });

        if (!branch) {
            throw new ApiError(404, 'Branch not found');
        }
    }

    const updated = await prisma.service.update({
        where: { id },
        data: {
            branchId: payload.branchId,
            name: payload.name,
            description: payload.description,
            price: payload.price,
            durationMinutes: payload.durationMinutes,
            category: payload.category,
            imageUrl: payload.imageUrl,
            isActive: payload.isActive,
            orderIndex: payload.orderIndex,
        },
        include: { branch: true },
    });

    return serializeService(updated);
};

const remove = async (id) => {
    const service = await prisma.service.findFirst({
        where: { id, deletedAt: null },
    });

    if (!service) {
        throw new ApiError(404, 'Service not found');
    }

    const updated = await prisma.service.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            isActive: false,
        },
    });

    return serializeService(updated);
};

module.exports = {
    list,
    getById,
    create,
    update,
    remove,
    serializeService,
};
