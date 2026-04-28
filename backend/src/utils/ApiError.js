class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    this.isOperational = true;
  }
}

module.exports = ApiError;
