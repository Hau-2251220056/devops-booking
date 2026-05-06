const { body, param, query } = require('express-validator');

const listUsersValidation = [
    query('q').optional().trim().isLength({ max: 200 }).withMessage('q is too long'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit must be between 1 and 100'),
];

const updateUserValidation = [
    param('id').isUUID().withMessage('Invalid user id'),
    body('role')
        .optional()
        .isIn(['admin', 'staff', 'customer'])
        .withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('firstName').optional().trim().isLength({ max: 100 }).withMessage('firstName too long'),
    body('lastName').optional().trim().isLength({ max: 100 }).withMessage('lastName too long'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('phone too long'),
    body().custom((_, { req }) => {
        if (
            req.body.role === undefined &&
            req.body.isActive === undefined &&
            req.body.firstName === undefined &&
            req.body.lastName === undefined &&
            req.body.phone === undefined
        ) {
            throw new Error('At least one field is required');
        }

        return true;
    }),
];

const createUserValidation = [
    body('username').exists().trim().isLength({ min: 3, max: 100 }).withMessage('username required (3-100)'),
    body('email').exists().trim().isEmail().withMessage('Valid email required'),
    body('password').optional().isLength({ min: 6 }).withMessage('password must be >=6 chars'),
    body('firstName').optional().trim().isLength({ max: 100 }).withMessage('firstName too long'),
    body('lastName').optional().trim().isLength({ max: 100 }).withMessage('lastName too long'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('phone too long'),
    body('role').optional().isIn(['admin', 'staff', 'customer']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const userIdValidation = [param('id').isUUID().withMessage('Invalid user id')];

module.exports = {
    listUsersValidation,
    updateUserValidation,
    createUserValidation,
    userIdValidation,
};