const { body, param } = require("express-validator");

const idParamValidation = [
  param("id").isUUID().withMessage("Invalid service id"),
];

const createServiceValidation = [
  body("branchId").isUUID().withMessage("branchId is required"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ max: 255 }),
  body("description").optional({ nullable: true, checkFalsy: true }).trim(),
  body("price").isFloat({ gt: 0 }).withMessage("price must be greater than 0"),
  body("durationMinutes")
    .isInt({ gt: 0 })
    .withMessage("durationMinutes must be greater than 0"),
  body("category")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body("imageUrl").optional({ nullable: true, checkFalsy: true }).trim(),
  body("isActive").optional().isBoolean(),
  body("orderIndex").optional().isInt({ min: 0 }),
];

const updateServiceValidation = [
  param("id").isUUID().withMessage("Invalid service id"),
  body("branchId").optional().isUUID().withMessage("branchId must be valid"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty")
    .isLength({ max: 255 }),
  body("description").optional({ nullable: true, checkFalsy: true }).trim(),
  body("price").optional().isFloat({ gt: 0 }),
  body("durationMinutes").optional().isInt({ gt: 0 }),
  body("category")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body("imageUrl").optional({ nullable: true, checkFalsy: true }).trim(),
  body("isActive").optional().isBoolean(),
  body("orderIndex").optional().isInt({ min: 0 }),
];

module.exports = {
  idParamValidation,
  createServiceValidation,
  updateServiceValidation,
};
