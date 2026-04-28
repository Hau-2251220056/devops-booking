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

const getAvailableSlots = async ({ date, barberId }) => {
  const bookingDate = parseDateOnly(date);
  if (!bookingDate) {
    throw new ApiError(400, "Invalid date");
  }

  const barber = await prisma.barber.findFirst({
    where: { id: barberId, deletedAt: null, isActive: true },
    include: { branch: true },
  });

  if (!barber) {
    throw new ApiError(404, "Barber not found");
  }

  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      branchId: barber.branchId,
      isActive: true,
    },
    orderBy: { startTime: "asc" },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      barberId,
      bookingDate,
      status: {
        in: ["pending", "confirmed", "completed"],
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const bookedSlotMap = new Set(
    bookings.map(
      (item) =>
        `${formatTimeOnly(item.startTime)}-${formatTimeOnly(item.endTime)}`,
    ),
  );

  return {
    date: formatDateOnly(bookingDate),
    barber: {
      id: barber.id,
      branchId: barber.branchId,
      branch: barber.branch,
    },
    availableSlots: timeSlots
      .filter(
        (slot) =>
          !bookedSlotMap.has(
            `${formatTimeOnly(slot.startTime)}-${formatTimeOnly(slot.endTime)}`,
          ),
      )
      .map((slot) => ({
        id: slot.id,
        startTime: formatTimeOnly(slot.startTime),
        endTime: formatTimeOnly(slot.endTime),
        durationMinutes: slot.durationMinutes,
        isActive: slot.isActive,
      })),
  };
};

const createBooking = async (payload, customerId) => {
  const bookingDate = parseDateOnly(payload.bookingDate);
  const startTime = parseTimeOnly(payload.startTime);
  const endTime = parseTimeOnly(payload.endTime);

  if (!bookingDate || !startTime || !endTime) {
    throw new ApiError(400, "Invalid booking date or time");
  }

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    throw new ApiError(400, "startTime must be earlier than endTime");
  }

  if (isPastDateOnly(bookingDate)) {
    throw new ApiError(400, "Cannot book a past date");
  }

  const barber = await prisma.barber.findFirst({
    where: { id: payload.barberId, deletedAt: null, isActive: true },
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

  const matchingSlot = await prisma.timeSlot.findFirst({
    where: {
      branchId: barber.branchId,
      isActive: true,
      startTime,
      endTime,
    },
  });

  if (!matchingSlot) {
    throw new ApiError(400, "Selected time slot is not available");
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      barberId: payload.barberId,
      bookingDate,
      startTime,
      endTime,
      status: {
        in: ["pending", "confirmed", "completed"],
      },
    },
  });

  if (existingBooking) {
    throw new ApiError(409, "This time slot is already booked");
  }

  const totalAmount = services.reduce(
    (sum, service) => sum + Number(service.price),
    0,
  );

  const booking = await prisma.booking.create({
    data: {
      customerId,
      barberId: payload.barberId,
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
  const where = {};

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
  serializeBooking,
};
