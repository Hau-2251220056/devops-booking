const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const serviceService = require("../services/serviceService");

const list = asyncHandler(async (req, res) => {
  const result = await serviceService.list();
  return sendSuccess(res, "Success", result);
});

const getById = asyncHandler(async (req, res) => {
  const result = await serviceService.getById(req.params.id);
  return sendSuccess(res, "Success", result);
});

const create = asyncHandler(async (req, res) => {
  const result = await serviceService.create(req.body);
  return sendSuccess(res, "Service created successfully", result, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await serviceService.update(req.params.id, req.body);
  return sendSuccess(res, "Service updated successfully", result);
});

const remove = asyncHandler(async (req, res) => {
  const result = await serviceService.remove(req.params.id);
  return sendSuccess(res, "Service deleted successfully", result);
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
