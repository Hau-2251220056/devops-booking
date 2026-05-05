const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.get("/stats", authMiddleware, adminMiddleware, adminController.getStats);

module.exports = router;