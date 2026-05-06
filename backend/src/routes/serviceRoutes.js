const express = require('express');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
    createServiceValidation,
    idParamValidation,
    updateServiceValidation,
} = require('../validations/serviceValidation');

const router = express.Router();

router.get('/', serviceController.list);
router.get(
    '/:id',
    idParamValidation,
    validateRequest,
    serviceController.getById,
);
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    createServiceValidation,
    validateRequest,
    serviceController.create,
);
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    updateServiceValidation,
    validateRequest,
    serviceController.update,
);
router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    idParamValidation,
    validateRequest,
    serviceController.remove,
);

module.exports = router;
