// @ts-nocheck
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const bookingService = require("../services/bookingService");

const getAvailableSlots = asyncHandler(async (req, res) => {
  const result = await bookingService.getAvailableSlots(req.query);
  return sendSuccess(res, "Success", result);
});

const create = asyncHandler(async (req, res) => {
  const result = await bookingService.createBooking(req.body, req.user.id);
  return sendSuccess(res, "Booking created successfully", result, 201);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listMyBookings(req.user.id);
  return sendSuccess(res, "Success", result);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await bookingService.listAll(req.query);
  return sendSuccess(res, "Success", result);
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await bookingService.updateStatus(
    req.params.id,
    req.body.status,
  );
  return sendSuccess(res, "Booking status updated successfully", result);
});

const remove = asyncHandler(async (req, res) => {
  const result = await bookingService.cancelBooking(
    req.params.id,
    req.user,
    req.body?.reason,
  );
  return sendSuccess(res, "Booking cancelled successfully", result);
});

module.exports = {
  getAvailableSlots,
  create,
  getMyBookings,
  getAll,
  updateStatus,
  remove,
};
