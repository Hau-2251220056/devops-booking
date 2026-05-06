const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const prisma = require("../src/configs/prisma");

// Helper to sign a dev token (matches authMiddleware default in dev)
const DEV_JWT_SECRET = process.env.JWT_SECRET || "booking-system-dev-secret";
const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_UUID_2 = "123e4567-e89b-12d3-a456-426614174001";
const makeAuthHeader = (payload = { id: VALID_UUID, role: "customer" }) => {
  const token = jwt.sign(payload, DEV_JWT_SECRET);
  return `Bearer ${token}`;
};

// Save originals to restore
const original = {
  barber_findFirst: prisma.barber.findFirst,
  service_findMany: prisma.service.findMany,
  transaction: prisma.$transaction,
  booking_findMany: prisma.booking.findMany,
  booking_findUnique: prisma.booking.findUnique,
  booking_update: prisma.booking.update,
};

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api`;
});

test.after(() => {
  server.close();
});

test.afterEach(() => {
  // restore prisma
  prisma.barber.findFirst = original.barber_findFirst;
  prisma.service.findMany = original.service_findMany;
  prisma.$transaction = original.transaction;
  prisma.booking.findMany = original.booking_findMany;
  prisma.booking.findUnique = original.booking_findUnique;
  prisma.booking.update = original.booking_update;
});

test("POST /bookings - booking success", async () => {
  // mocks
  prisma.barber.findFirst = async () => ({
    id: VALID_UUID,
    branchId: "branch-1",
    isActive: true,
  });
  prisma.service.findMany = async () => [{ id: VALID_UUID_2, price: 100 }];

  prisma.$transaction = async (fn) => {
    const tx = {
      booking: {
        findMany: async () => [],
        create: async ({ data }) => ({
          id: "booking-1",
          ...data,
          customer: { id: data.customerId, username: "u" },
          barber: { id: data.barberId, user: { id: "u2" } },
          branch: { id: data.branchId },
          bookingServices: [
            {
              id: "bs1",
              service: { id: "svc-1", name: "S" },
              ...data.bookingServices?.create?.[0],
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    };

    return fn(tx);
  };

  const res = await fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: makeAuthHeader({ id: "user-1", role: "customer" }),
    },
    body: JSON.stringify({
      barberId: VALID_UUID,
      bookingDate: "2099-01-10",
      startTime: "08:00",
      endTime: "08:30",
      serviceIds: [VALID_UUID_2],
    }),
  });

  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.message, "Booking created successfully");
  assert.equal(body.data.customerId, "user-1");
});

test("POST /bookings - booking duplicate (409)", async () => {
  prisma.barber.findFirst = async () => ({
    id: VALID_UUID,
    branchId: "branch-1",
    isActive: true,
  });
  prisma.service.findMany = async () => [{ id: VALID_UUID_2, price: 100 }];

  prisma.$Transaction_original = prisma.$transaction;
  prisma.$transaction = async (fn) => {
    const tx = {
      booking: {
        // overlapping booking exists (use Date objects so overlap detection works)
        findMany: async () => [
          {
            startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
            endTime: new Date(Date.UTC(1970, 0, 1, 8, 30)),
          },
        ],
        create: async () => ({}),
      },
    };
    return fn(tx);
  };

  const res = await fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: makeAuthHeader({ id: "user-1", role: "customer" }),
    },
    body: JSON.stringify({
      barberId: VALID_UUID,
      bookingDate: "2099-01-10",
      startTime: "08:00",
      endTime: "08:30",
      serviceIds: [VALID_UUID_2],
    }),
  });

  assert.equal(res.status, 409);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.message, "Selected time slot is already booked");
});

test("POST /bookings - missing field results validation error (400)", async () => {
  const res = await fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: makeAuthHeader({ id: VALID_UUID, role: "customer" }),
    },
    body: JSON.stringify({
      // missing barberId and workerId
      bookingDate: "2099-01-10",
      startTime: "08:00",
      endTime: "08:30",
      serviceIds: [VALID_UUID_2],
    }),
  });

  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.message, "Validation failed");
  assert.ok(Array.isArray(body.data));
});

test("GET /bookings/my-bookings - returns list", async () => {
  prisma.booking.findMany = async () => [
    {
      id: VALID_UUID,
      customerId: VALID_UUID,
      barberId: VALID_UUID,
      bookingDate: new Date("2099-01-10"),
      startTime: "08:00",
      endTime: "08:30",
      totalAmount: 100,
      status: "pending",
      bookingServices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const res = await fetch(`${baseUrl}/bookings/my-bookings`, {
    method: "GET",
    headers: {
      Authorization: makeAuthHeader({ id: VALID_UUID, role: "customer" }),
    },
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.equal(body.data.length, 1);
});

test("DELETE /bookings/:id - cancel booking success", async () => {
  prisma.booking.findUnique = async () => ({
    id: VALID_UUID,
    customerId: VALID_UUID,
    status: "pending",
  });
  prisma.booking.update = async ({ where, data }) => ({
    id: where.id,
    ...data,
    customer: { id: VALID_UUID },
    barber: { user: { id: "u2" } },
    bookingServices: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const res = await fetch(`${baseUrl}/bookings/${VALID_UUID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: makeAuthHeader({ id: "admin-1", role: "admin" }),
    },
    body: JSON.stringify({ reason: "No longer needed" }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.message, "Booking cancelled successfully");
});
