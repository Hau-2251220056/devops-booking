// @ts-nocheck
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, "Register successful", result, 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, "Login successful", result);
});

const profile = asyncHandler(async (req, res) => {
  const result = await authService.profile(req.user.id);
  return sendSuccess(res, "Success", result);
});

module.exports = {
  register,
  login,
  profile,
};
