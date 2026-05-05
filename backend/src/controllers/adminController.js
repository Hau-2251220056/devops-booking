// @ts-nocheck
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const adminService = require("../services/adminService");

const getStats = asyncHandler(async (_req, res) => {
  const result = await adminService.getStats();
  return sendSuccess(res, "Success", result);
});

module.exports = {
  getStats,
};