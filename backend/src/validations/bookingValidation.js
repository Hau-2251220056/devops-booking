const { body, param, query } = require("express-validator");

const availableSlotsValidation = [
  query("date")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("date must be YYYY-MM-DD"),
  query("barberId").isUUID().withMessage("barberId is required"),
];

const createBookingValidation = [
  body("barberId").isUUID().withMessage("barberId is required"),
  body("bookingDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("bookingDate must be YYYY-MM-DD"),
  body("startTime")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("startTime must be HH:mm"),
  body("endTime")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("endTime must be HH:mm"),
  body("serviceIds")
    .isArray({ min: 1 })
    .withMessage("serviceIds must be a non-empty array"),
  body("serviceIds.*").isUUID().withMessage("Each serviceId must be valid"),
  body("notes").optional({ nullable: true, checkFalsy: true }).trim(),
];

const idParamValidation = [
  param("id").isUUID().withMessage("Invalid booking id"),
];

const updateStatusValidation = [
  param("id").isUUID().withMessage("Invalid booking id"),
  body("status")
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage("Invalid booking status"),
];

module.exports = {
  availableSlotsValidation,
  createBookingValidation,
  idParamValidation,
  updateStatusValidation,
};
