const express = require("express");
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  availableSlotsValidation,
  createBookingValidation,
  idParamValidation,
  updateStatusValidation,
} = require("../validations/bookingValidation");

const router = express.Router();

router.get(
  "/available-slots",
  availableSlotsValidation,
  validateRequest,
  bookingController.getAvailableSlots,
);
router.post(
  "/",
  authMiddleware,
  createBookingValidation,
  validateRequest,
  bookingController.create,
);
router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);
router.get("/", authMiddleware, adminMiddleware, bookingController.getAll);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateStatusValidation,
  validateRequest,
  bookingController.updateStatus,
);
router.delete(
  "/:id",
  authMiddleware,
  idParamValidation,
  validateRequest,
  bookingController.remove,
);

module.exports = router;
