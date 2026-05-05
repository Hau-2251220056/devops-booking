// @ts-nocheck
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const adminUserService = require("../services/adminUserService");

const listUsers = asyncHandler(async (req, res) => {
    const result = await adminUserService.listUsers(req.query);
    return sendSuccess(res, "Success", result);
});

const updateUser = asyncHandler(async (req, res) => {
    const result = await adminUserService.updateUser(req.params.id, req.body);
    return sendSuccess(res, "User updated successfully", result);
});

const createUser = asyncHandler(async (req, res) => {
    const result = await adminUserService.createUser(req.body);
    return sendSuccess(res, "User created successfully", result);
});

const deleteUser = asyncHandler(async (req, res) => {
    const result = await adminUserService.deleteUser(req.params.id, req.user.id);
    return sendSuccess(res, "User deleted successfully", result);
});

module.exports = {
    listUsers,
    updateUser,
    createUser,
    deleteUser,
};