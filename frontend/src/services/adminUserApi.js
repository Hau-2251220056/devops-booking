import adminApiClient from "./adminApi";

const normalizeUser = (user) => ({
    id: user?.id || "",
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "customer",
    isActive: Boolean(user?.isActive),
    createdAt: user?.createdAt || null,
    avatarUrl: user?.avatarUrl || null,
});

const normalizeUsersList = (payload) => {
    const source = payload?.data;
    const rawUsers = Array.isArray(source)
        ? source
        : Array.isArray(source?.users)
            ? source.users
            : [];

    return {
        users: rawUsers.map(normalizeUser),
        page: Number(source?.page ?? 1),
        limit: Number(source?.limit ?? (rawUsers.length || 10)),
        total: Number(source?.total ?? rawUsers.length),
        totalPages: Number(source?.totalPages ?? 1),
    };
};

export const getUsers = async ({ page = 1, limit = 10, q = "" } = {}) => {
    try {
        const response = await adminApiClient.get("/admin/users", {
            params: { page, limit, q: q || undefined },
        });
        const payload = response.data;

        return {
            success: Boolean(payload?.success ?? true),
            message: payload?.message || "Success",
            data: normalizeUsersList(payload),
        };
    } catch (error) {
        return {
            success: false,
            message:
                error?.response?.data?.message || error?.message || "Unknown error",
            data: { users: [], page, limit, total: 0, totalPages: 0 },
        };
    }
};

export const updateUser = async (id, payload) => {
    try {
        const response = await adminApiClient.patch(`/admin/users/${id}`, payload);
        const body = response.data;

        return {
            success: Boolean(body?.success ?? true),
            message: body?.message || "Updated successfully",
            data: normalizeUser(body?.data),
        };
    } catch (error) {
        return {
            success: false,
            message:
                error?.response?.data?.message || error?.message || "Unknown error",
            data: null,
        };
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await adminApiClient.delete(`/admin/users/${id}`);
        const body = response.data;

        return {
            success: Boolean(body?.success ?? true),
            message: body?.message || "Deleted successfully",
            data: body?.data ? normalizeUser(body.data) : null,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error?.response?.data?.message || error?.message || "Unknown error",
            data: null,
        };
    }
};

export const createUser = async (payload) => {
    try {
        const response = await adminApiClient.post(`/admin/users`, payload);
        const body = response.data;

        return {
            success: Boolean(body?.success ?? true),
            message: body?.message || "Created successfully",
            data: normalizeUser(body?.data),
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || "Unknown error",
            data: null,
        };
    }
};

export default {
    getUsers,
    updateUser,
    deleteUser,
    createUser,
};