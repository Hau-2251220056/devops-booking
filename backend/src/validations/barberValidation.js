const { body, param } = require('express-validator');

const createBarberValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('username is required')
        .isLength({ min: 3, max: 100 }),
    body('email').trim().notEmpty().withMessage('email is required').isEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('password is required and must be at least 6 characters'),
    body('firstName')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 100 }),
    body('lastName')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 100 }),
    body('phone')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 20 }),
    body('branchId').isUUID().withMessage('branchId is required'),
    body('specialization')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 }),
    body('experienceYears').optional().isInt({ min: 0 }),
    body('bio').optional({ nullable: true, checkFalsy: true }).trim(),
    body('isActive').optional().isBoolean(),
    body('isAvailable').optional().isBoolean(),
];

const updateBarberValidation = [
    param('id').isUUID().withMessage('Invalid barber id'),
    body('username')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('username cannot be empty')
        .isLength({ min: 3, max: 100 }),
    body('email').optional().trim().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('firstName')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 100 }),
    body('lastName')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 100 }),
    body('phone')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 20 }),
    body('branchId').optional().isUUID(),
    body('specialization')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 }),
    body('experienceYears').optional().isInt({ min: 0 }),
    body('bio').optional({ nullable: true, checkFalsy: true }).trim(),
    body('isActive').optional().isBoolean(),
    body('isAvailable').optional().isBoolean(),
];

const idParamValidation = [
    param('id').isUUID().withMessage('Invalid barber id'),
];

module.exports = {
    createBarberValidation,
    updateBarberValidation,
    idParamValidation,
};
