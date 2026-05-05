const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const {
  formatDateOnly,
  formatTimeOnly,
  isPastDateOnly,
  parseDateOnly,
  parseTimeOnly,
  timeToMinutes,
} = require("../utils/date");
const {
  generateTimeSlots,
  SLOT_INTERVAL_MINUTES,
} = require("../utils/generateTimeSlots");

const BOOKABLE_STATUSES = ["pending", "confirmed"];

const getNowInHoChiMinh = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(now)
    .reduce((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

const isOverlap = (startTime, endTime, existingStart, existingEnd) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const existingStartMinutes = timeToMinutes(existingStart);
  const existingEndMinutes = timeToMinutes(existingEnd);

  if (
    startMinutes === null ||
    endMinutes === null ||
    existingStartMinutes === null ||
    existingEndMinutes === null
  ) {
    return false;
  }

  return startMinutes < existingEndMinutes && endMinutes > existingStartMinutes;
};

const normalizeWorkerId = (payload = {}) =>
  payload.workerId || payload.barberId;

const serializeBookingService = (item) => ({
  id: item.id,
  bookingId: item.bookingId,
  serviceId: item.serviceId,
  quantity: item.quantity,
  unitPrice: item.unitPrice?.toString?.() ?? String(item.unitPrice),
  subtotal: item.subtotal?.toString?.() ?? String(item.subtotal),
  service: item.service
    ? {
        id: item.service.id,
        name: item.service.name,
        durationMinutes: item.service.durationMinutes,
        category: item.service.category,
        price: item.service.price?.toString?.() ?? String(item.service.price),
      }
    : null,
});

const serializeBooking = (booking) => ({
  id: booking.id,
  customerId: booking.customerId,
  barberId: booking.barberId,
  branchId: booking.branchId,
  bookingDate: formatDateOnly(booking.bookingDate),
  startTime: formatTimeOnly(booking.startTime),
  endTime: formatTimeOnly(booking.endTime),
  totalAmount: booking.totalAmount?.toString?.() ?? String(booking.totalAmount),
  notes: booking.notes,
  status: booking.status,
  cancellationReason: booking.cancellationReason,
  cancelledAt: booking.cancelledAt,
  cancelledBy: booking.cancelledBy,
  completedAt: booking.completedAt,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
  customer: booking.customer
    ? {
        id: booking.customer.id,
        username: booking.customer.username,
        email: booking.customer.email,
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
        phone: booking.customer.phone,
        role: booking.customer.role,
      }
    : null,
  barber: booking.barber
    ? {
        id: booking.barber.id,
        specialization: booking.barber.specialization,
        experienceYears: booking.barber.experienceYears,
        rating: Number(booking.barber.rating),
        totalBookings: booking.barber.totalBookings,
        isActive: booking.barber.isActive,
        isAvailable: booking.barber.isAvailable,
        user: booking.barber.user
          ? {
              id: booking.barber.user.id,
              username: booking.barber.user.username,
              email: booking.barber.user.email,
              firstName: booking.barber.user.firstName,
              lastName: booking.barber.user.lastName,
              phone: booking.barber.user.phone,
              role: booking.barber.user.role,
            }
          : null,
      }
    : null,
  branch: booking.branch || null,
  bookingServices: booking.bookingServices
    ? booking.bookingServices.map(serializeBookingService)
    : [],
});

const getAvailableSlots = async ({ date, workerId, barberId }) => {
  const bookingDate = parseDateOnly(date);
  if (!bookingDate) {
    throw new ApiError(400, "Invalid date");
  }

  const resolvedBarberId = normalizeWorkerId({ workerId, barberId });
  if (!resolvedBarberId) {
    throw new ApiError(400, "workerId is required");
  }

  const barber = await prisma.barber.findFirst({
    where: { id: resolvedBarberId, deletedAt: null, isActive: true },
    include: { branch: true },
  });

  if (!barber) {
    throw new ApiError(404, "Barber not found");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      barberId: resolvedBarberId,
      bookingDate,
      status: { in: BOOKABLE_STATUSES },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const generatedSlots = generateTimeSlots({
    date: bookingDate,
    existingBookings: bookings.map((booking) => ({
      startTime: formatTimeOnly(booking.startTime),
      endTime: formatTimeOnly(booking.endTime),
    })),
  });

  return generatedSlots.map((slot) => ({
    start: slot.start,
    end: slot.end,
    available: slot.available,
  }));
};

const createBooking = async (payload, customerId) => {
  const bookingDate = parseDateOnly(payload.bookingDate);
  const startTime = parseTimeOnly(payload.startTime);
  const endTime = parseTimeOnly(payload.endTime);
  const resolvedBarberId = normalizeWorkerId(payload);

  if (!bookingDate || !startTime || !endTime) {
    throw new ApiError(400, "Invalid booking date or time");
  }

  if (!resolvedBarberId) {
    throw new ApiError(400, "barberId is required");
  }

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    throw new ApiError(400, "startTime must be earlier than endTime");
  }

  if (
    timeToMinutes(endTime) - timeToMinutes(startTime) !==
    SLOT_INTERVAL_MINUTES
  ) {
    throw new ApiError(400, "Selected slot must be 30 minutes");
  }

  if (isPastDateOnly(bookingDate)) {
    throw new ApiError(400, "Cannot book a past date");
  }

  const nowLocal = getNowInHoChiMinh();
  const targetDate = formatDateOnly(bookingDate);
  const startMinutes = timeToMinutes(startTime);

  if (targetDate === nowLocal.date && startMinutes < nowLocal.minutes + 30) {
    throw new ApiError(400, "Bookings must be at least 30 minutes in advance");
  }

  const barber = await prisma.barber.findFirst({
    where: { id: resolvedBarberId, deletedAt: null, isActive: true },
    include: { branch: true },
  });

  if (!barber) {
    throw new ApiError(404, "Barber not found");
  }

  const services = await prisma.service.findMany({
    where: {
      id: { in: payload.serviceIds },
      branchId: barber.branchId,
      deletedAt: null,
      isActive: true,
    },
  });

  if (services.length !== payload.serviceIds.length) {
    throw new ApiError(
      400,
      "One or more services are invalid for this barber branch",
    );
  }

  const totalAmount = services.reduce(
    (sum, service) => sum + Number(service.price),
    0,
  );

  const booking = await prisma.$transaction(async (tx) => {
    const overlappingBookings = await tx.booking.findMany({
      where: {
        barberId: resolvedBarberId,
        bookingDate,
        status: { in: BOOKABLE_STATUSES },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const hasOverlap = overlappingBookings.some((bookingItem) =>
      isOverlap(
        formatTimeOnly(startTime),
        formatTimeOnly(endTime),
        formatTimeOnly(bookingItem.startTime),
        formatTimeOnly(bookingItem.endTime),
      ),
    );

    if (hasOverlap) {
      throw new ApiError(409, "Selected time slot is already booked");
    }

    const slotExists = generateTimeSlots({
      date: bookingDate,
      existingBookings: [],
    }).some(
      (slot) =>
        slot.start === formatTimeOnly(startTime) &&
        slot.end === formatTimeOnly(endTime),
    );

    if (!slotExists) {
      throw new ApiError(400, "Selected time slot is not available");
    }

    return tx.booking.create({
      data: {
        customerId,
        barberId: resolvedBarberId,
        branchId: barber.branchId,
        bookingDate,
        startTime,
        endTime,
        totalAmount,
        notes: payload.notes,
        status: "pending",
        bookingServices: {
          create: services.map((service) => ({
            serviceId: service.id,
            quantity: 1,
            unitPrice: service.price,
            subtotal: service.price,
          })),
        },
      },
      include: {
        customer: true,
        barber: {
          include: {
            user: true,
          },
        },
        branch: true,
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
    });
  });

  return serializeBooking(booking);
};

const listMyBookings = async (userId) => {
  const bookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      customer: true,
      barber: {
        include: {
          user: true,
        },
      },
      branch: true,
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map(serializeBooking);
};

const listAll = async (filters = {}) => {
  const where = {
    deletedAt: null, // Exclude soft-deleted bookings
  };

  if (filters.status) where.status = filters.status;
  if (filters.barberId) where.barberId = filters.barberId;
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.bookingDate)
    where.bookingDate = parseDateOnly(filters.bookingDate);

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: true,
      barber: {
        include: {
          user: true,
        },
      },
      branch: true,
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map(serializeBooking);
};

const updateStatus = async (id, status) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status === "completed" && status !== "completed") {
    throw new ApiError(400, "Completed booking cannot be changed");
  }

  if (booking.status === "cancelled" && status !== "cancelled") {
    throw new ApiError(400, "Cancelled booking cannot be changed");
  }

  const data = {
    status,
  };

  if (status === "cancelled") {
    data.cancelledAt = new Date();
  }

  if (status === "completed") {
    data.completedAt = new Date();
  }

  const updated = await prisma.booking.update({
    where: { id },
    data,
    include: {
      customer: true,
      barber: {
        include: {
          user: true,
        },
      },
      branch: true,
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
  });

  return serializeBooking(updated);
};

const cancelBooking = async (id, currentUser, reason) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status === "completed") {
    throw new ApiError(400, "Completed booking cannot be cancelled");
  }

  if (currentUser.role !== "admin" && booking.customerId !== currentUser.id) {
    throw new ApiError(403, "You can only cancel your own booking");
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: currentUser.id,
      cancellationReason: reason || `Cancelled by ${currentUser.role}`,
      deletedAt: new Date(), // Soft delete: mark as deleted
    },
    include: {
      customer: true,
      barber: {
        include: {
          user: true,
        },
      },
      branch: true,
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
  });

  return serializeBooking(updated);
};

const requestCancellation = async (id, currentUser, reason) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Only allow cancellation requests for pending and confirmed bookings
  if (
    !["pending", "confirmed", "cancellation_pending"].includes(booking.status)
  ) {
    throw new ApiError(
      400,
      `Cannot cancel booking with status: ${booking.status}`,
    );
  }

  // Users can only cancel their own bookings
  if (currentUser.role !== "admin" && booking.customerId !== currentUser.id) {
    throw new ApiError(403, "You can only cancel your own booking");
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "cancellation_pending",
      cancellationReason:
        reason || `Cancellation requested by ${currentUser.role}`,
      updatedAt: new Date(),
    },
    include: {
      customer: true,
      barber: {
        include: {
          user: true,
        },
      },
      branch: true,
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
  });

  return serializeBooking(updated);
};

const approveCancellation = async (id, currentUser) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== "cancellation_pending") {
    throw new ApiError(400, "Booking is not pending cancellation");
  }

  // Only admin can approve cancellation
  if (currentUser.role !== "admin") {
    throw new ApiError(403, "Only admin can approve cancellation");
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: currentUser.id,
      deletedAt: new Date(), // Soft delete
      updatedAt: new Date(),
    },
    include: {
      customer: true,
      barber: {
        include: {
          user: true,
        },
      },
      branch: true,
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
  });

  return serializeBooking(updated);
};

const rejectCancellation = async (id, currentUser) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== "cancellation_pending") {
    throw new ApiError(400, "Booking is not pending cancellation");
  }

  // Only admin can reject cancellation
  if (currentUser.role !== "admin") {
    throw new ApiError(403, "Only admin can reject cancellation");
  }

  // Revert back to confirmed
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "confirmed",
      cancellationReason: null,
      updatedAt: new Date(),
    },
    include: {
      customer: true,
      barber: {
        include: {
          user: true,
        },
      },
      branch: true,
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
  });

  return serializeBooking(updated);
};

module.exports = {
  getAvailableSlots,
  createBooking,
  listMyBookings,
  listAll,
  updateStatus,
  cancelBooking,
  requestCancellation,
  approveCancellation,
  rejectCancellation,
  serializeBooking,
};
