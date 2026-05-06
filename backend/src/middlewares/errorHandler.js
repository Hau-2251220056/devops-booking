const ApiError = require('../utils/ApiError');

const errorHandler = (error, req, res, _next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    if (error.name === 'PrismaClientKnownRequestError') {
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate record detected',
                data: null,
            });
        }

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Record not found',
                data: null,
            });
        }
    }

    if (error instanceof ApiError || error.isOperational) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: error.details || null,
        });
    }

    console.error(error);

    return res.status(statusCode).json({
        success: false,
        message:
      process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
        data: null,
    });
};

module.exports = errorHandler;
