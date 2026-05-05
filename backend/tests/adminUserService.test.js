const test = require("node:test");
const assert = require("node:assert/strict");

const prisma = require("../src/configs/prisma");
const adminUserService = require("../src/services/adminUserService");

const originalUserMethods = {
    count: prisma.user.count,
    findMany: prisma.user.findMany,
    findFirst: prisma.user.findFirst,
    update: prisma.user.update,
};

const restorePrisma = () => {
    prisma.user.count = originalUserMethods.count;
    prisma.user.findMany = originalUserMethods.findMany;
    prisma.user.findFirst = originalUserMethods.findFirst;
    prisma.user.update = originalUserMethods.update;
};

test.afterEach(() => {
    restorePrisma();
});

test("listUsers applies search and pagination", async () => {
    let countWhere = null;
    let findManyArgs = null;

    prisma.user.count = async ({ where }) => {
        countWhere = where;
        return 12;
    };

    prisma.user.findMany = async (args) => {
        findManyArgs = args;
        return [
            {
                id: "1",
                username: "alice",
                email: "alice@example.com",
                firstName: "Alice",
                lastName: "Nguyen",
                phone: "0901",
                avatarUrl: null,
                role: "customer",
                isActive: true,
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
            },
        ];
    };

    const result = await adminUserService.listUsers({ q: "alice", page: 2, limit: 5 });

    assert.equal(countWhere.deletedAt, null);
    assert.equal(countWhere.OR.length, 5);
    assert.equal(findManyArgs.skip, 5);
    assert.equal(findManyArgs.take, 5);
    assert.equal(result.page, 2);
    assert.equal(result.limit, 5);
    assert.equal(result.total, 12);
    assert.equal(result.totalPages, 3);
    assert.equal(result.users[0].username, "alice");
});

test("updateUser updates role and active state", async () => {
    prisma.user.findFirst = async () => ({ id: "1" });
    prisma.user.update = async ({ data }) => ({
        id: "1",
        username: "john",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "0902",
        avatarUrl: null,
        role: data.role,
        isActive: data.isActive,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const result = await adminUserService.updateUser("1", { role: "staff", isActive: false });

    assert.equal(result.role, "staff");
    assert.equal(result.isActive, false);
});

test("deleteUser prevents deleting own account", async () => {
    await assert.rejects(
        () => adminUserService.deleteUser("1", "1"),
        (error) => error.statusCode === 400 && error.message === "You cannot delete your own account",
    );
});