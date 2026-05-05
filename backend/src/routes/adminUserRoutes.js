const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const adminUserController = require("../controllers/adminUserController");
const {
    listUsersValidation,
    updateUserValidation,
    userIdValidation,
    createUserValidation,
} = require("../validations/adminUserValidation");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    listUsersValidation,
    validateRequest,
    adminUserController.listUsers,
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createUserValidation,
    validateRequest,
    adminUserController.createUser,
);

router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateUserValidation,
    validateRequest,
    adminUserController.updateUser,
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    userIdValidation,
    validateRequest,
    adminUserController.deleteUser,
);

module.exports = router;