const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const barberService = require("../services/barberService");

const list = asyncHandler(async (req, res) => {
  const result = await barberService.list();
  return sendSuccess(res, "Success", result);
});

const getById = asyncHandler(async (req, res) => {
  const result = await barberService.getById(req.params.id);
  return sendSuccess(res, "Success", result);
});

const create = asyncHandler(async (req, res) => {
  const result = await barberService.create(req.body);
  return sendSuccess(res, "Barber created successfully", result, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await barberService.update(req.params.id, req.body);
  return sendSuccess(res, "Barber updated successfully", result);
});

const remove = asyncHandler(async (req, res) => {
  const result = await barberService.remove(req.params.id);
  return sendSuccess(res, "Barber deleted successfully", result);
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
