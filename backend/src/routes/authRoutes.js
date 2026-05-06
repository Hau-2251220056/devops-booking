const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
    loginValidation,
    registerValidation,
} = require('../validations/authValidation');

const router = express.Router();

router.post(
    '/register',
    registerValidation,
    validateRequest,
    authController.register,
);
router.post('/login', loginValidation, validateRequest, authController.login);
router.get('/profile', authMiddleware, authController.profile);

module.exports = router;
