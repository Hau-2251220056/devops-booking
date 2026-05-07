const express = require('express');
const barberController = require('../controllers/barberController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
    createBarberValidation,
    idParamValidation,
    updateBarberValidation,
} = require('../validations/barberValidation');

const router = express.Router();

router.get('/', barberController.list);
router.get(
    '/:id',
    idParamValidation,
    validateRequest,
    barberController.getById,
);
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    createBarberValidation,
    validateRequest,
    barberController.create,
);
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    updateBarberValidation,
    validateRequest,
    barberController.update,
);
router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    idParamValidation,
    validateRequest,
    barberController.remove,
);

module.exports = router;
