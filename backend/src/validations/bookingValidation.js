const { body, param, query } = require("express-validator");

const availableSlotsValidation = [
  query("date")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("date must be YYYY-MM-DD"),
  query("workerId").optional().isUUID().withMessage("workerId must be valid"),
  query("barberId").optional().isUUID().withMessage("barberId must be valid"),
  query().custom((_, { req }) => {
    if (!req.query.workerId && !req.query.barberId) {
      throw new Error("workerId is required");
    }
    return true;
  }),
];

const createBookingValidation = [
  body("workerId").optional().isUUID().withMessage("workerId must be valid"),
  body("barberId").optional().isUUID().withMessage("barberId must be valid"),
  body().custom((_, { req }) => {
    if (!req.body.workerId && !req.body.barberId) {
      throw new Error("barberId is required");
    }
    return true;
  }),
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
