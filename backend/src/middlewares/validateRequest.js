const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new ApiError(400, "Validation failed");
    error.details = result.array().map((item) => ({
      field: item.path,
      message: item.msg,
    }));
    return next(error);
  }

  return next();
};

module.exports = validateRequest;
