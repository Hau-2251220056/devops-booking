# 🔴 BÁO CÁO PHÂN TÍCH INCIDENTS - DevOps Booking System

## INCIDENT #1: Mất Kết Nối Database Khi Server Shutdown

### 📌 Hiện Tượng (Phenomena)

- Khi server dừng (crash hoặc graceful shutdown), database connections không được đóng một cách an toàn
- Có thể gây ra các lỗi sau:
  - Connection pool exhausted (cạn kiệt connection pool)
  - Pending queries không hoàn thành
  - Data corruption hoặc mất dữ liệu trong transaction chưa hoàn thành
  - Logs hiển thị cảnh báo hoặc lỗi về unclosed connections

**Vị trí lỗi:** [backend/src/configs/prisma.js](backend/src/configs/prisma.js)

```javascript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

module.exports = prisma;
// ❌ Không có disconnect() khi server shutdown
```

---

### 🔍 Nguyên Nhân (Root Cause)

1. **Thiếu graceful shutdown handler**: Không có process signal handler để disconnect Prisma
2. **Không xử lý SIGTERM/SIGINT**: Server không lắng nghe các tín hiệu tắt máy
3. **Không implement cleanup logic**: Khi ứng dụng dừng, không có code để đóng connections

**Ảnh hưởng:**

- Trong Docker/Kubernetes: Container sẽ tắt nhưng vẫn giữ database locks
- Khiến các container khác không thể kết nối
- Dẫn đến downtime khi deploy hoặc restart

---

### ✅ Cách Fix (Solution)

#### **Bước 1:** Cập nhật file `src/server.js`

```javascript
require("dotenv").config();

const app = require("./app");
const prisma = require("./configs/prisma");

console.log(" [BOOT] server.js starting...");

const PORT = process.env.PORT || 5000;

console.log(" [ENV] PORT =", PORT);

if (!PORT) {
  console.error(" PORT is not defined");
  throw new Error("PORT is not defined");
}

let server;

try {
  server = app.listen(PORT, () => {
    console.log(" [SERVER] Server is running");
    console.log(` [SERVER] Listening on port: ${PORT}`);
    console.log("Health check: /api/health");
  });
} catch (err) {
  console.error(" [FATAL] Failed to start server:");
  console.error(err);
  process.exit(1);
}

// ✅ NEW: Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(
    `\n [SHUTDOWN] Received ${signal} signal, shutting down gracefully...`,
  );

  // Dừng nhận request mới
  server.close(async () => {
    console.log(" [SHUTDOWN] HTTP server closed");

    try {
      // Đóng database connection
      await prisma.$disconnect();
      console.log(" [SHUTDOWN] Database connection closed");
      process.exit(0);
    } catch (err) {
      console.error(" [SHUTDOWN] Error during graceful shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown sau 30 giây
  setTimeout(() => {
    console.error(" [SHUTDOWN] Forced shutdown after 30 seconds");
    process.exit(1);
  }, 30000);
};

// ✅ NEW: Listen to shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error(" [UNCAUGHT_EXCEPTION]");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error(" [UNHANDLED_REJECTION]");
  console.error(err);
  process.exit(1);
});
```

---

## INCIDENT #2: Không Có Cơ Chế Refresh Token - JWT Hết Hạn Đột Ngột

### 📌 Hiện Tượng (Phenomena)

- Người dùng đang làm việc (ví dụ: booking dịch vụ) thì bị logout đột ngột
- Sau 7 ngày, token tự động hết hạn
- Không có cách để giữ session sống mà không phải login lại
- Trên mobile apps, user phải login lại sau 7 ngày
- Request API bị reject với lỗi `401 Unauthorized`

**Vị trí lỗi:**

- [backend/src/services/authService.js](backend/src/services/authService.js) (line 20-26)
- [backend/src/middlewares/authMiddleware.js](backend/src/middlewares/authMiddleware.js)

```javascript
const signToken = (user) => {
  return jwt.sign(tokenPayload(user), getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d", // ❌ 7 ngày cố định
  });
};

// ❌ Middleware chỉ verify token, không hỗ trợ refresh
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
```

---

### 🔍 Nguyên Nhân (Root Cause)

1. **Chỉ có Access Token**: Hệ thống chỉ cấp 1 token duy nhất hết hạn sau 7 ngày
2. **Không có Refresh Token**: Không có cơ chế để cấp token mới mà không cần login lại
3. **Thiết kế JWT không phù hợp**: Token được set hết hạn quá lâu mà không có backup strategy

**Ảnh hưởng:**

- User experience tệ: người dùng bị logout bất ngờ
- Mất dữ liệu: nếu user đang fill form 7 ngày + 1 giây, form sẽ mất
- Mobile apps: không thể tự động refresh token

---

### ✅ Cách Fix (Solution)

#### **Bước 1:** Update `src/services/authService.js`

```javascript
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new ApiError(500, "JWT_SECRET is required in production");
  }

  return "booking-system-dev-secret";
};

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new ApiError(500, "REFRESH_TOKEN_SECRET is required in production");
  }

  return "booking-system-dev-refresh-secret";
};

const tokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
});

// ✅ NEW: Cấp access token (ngắn hạn - 15 phút)
const signAccessToken = (user) => {
  return jwt.sign(tokenPayload(user), getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m", // 15 phút
  });
};

// ✅ NEW: Cấp refresh token (dài hạn - 30 ngày)
const signRefreshToken = (user) => {
  return jwt.sign(tokenPayload(user), getRefreshTokenSecret(), {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d", // 30 ngày
  });
};

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.role,
  isActive: user.isActive,
  isVerified: user.isVerified,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (payload) => {
  const { username, email, password, firstName, lastName, phone } = payload;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: "customer",
      isActive: true,
      isVerified: true,
    },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
};

const login = async ({ identifier, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = signAccessToken(updatedUser);
  const refreshToken = signRefreshToken(updatedUser);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(updatedUser),
  };
};

// ✅ NEW: Refresh token function
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, "User not found or inactive");
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};

const profile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      barber: {
        include: {
          branch: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new ApiError(404, "User not found");
  }

  return {
    ...sanitizeUser(user),
    barber: user.barber
      ? {
          id: user.barber.id,
          branchId: user.barber.branchId,
          specialization: user.barber.specialization,
          experienceYears: user.barber.experienceYears,
          rating: Number(user.barber.rating),
          totalBookings: user.barber.totalBookings,
          bio: user.barber.bio,
          avatarUrl: user.barber.avatarUrl,
          isActive: user.barber.isActive,
          isAvailable: user.barber.isAvailable,
          branch: user.barber.branch,
        }
      : null,
  };
};

module.exports = {
  register,
  login,
  profile,
  sanitizeUser,
  signAccessToken,
  signRefreshToken,
  refreshAccessToken,
};
```

#### **Bước 2:** Add endpoint refresh token trong `src/routes/authRoutes.js`

```javascript
// Thêm route này vào authRoutes
router.post("/refresh", validateRequest, authController.refreshToken);
```

#### **Bước 3:** Add controller function

```javascript
// Trong src/controllers/authController.js
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  return sendSuccess(res, "Token refreshed successfully", result);
});

module.exports = {
  register,
  login,
  profile,
  refreshToken,
};
```

#### **Bước 4:** Update `.env`

```env
JWT_EXPIRES_IN=15m
JWT_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-key-here
REFRESH_TOKEN_EXPIRES_IN=30d
```

---

## INCIDENT #3: Không Kiểm Tra Service Tồn Tại Khi Tạo Booking

### 📌 Hiện Tượng (Phenomena)

- User có thể tạo booking với `serviceIds` không hợp lệ hoặc không tồn tại
- Hệ thống không validate xem service có thực sự tồn tại trong database hay không
- Có thể tạo booking với service bị xóa
- Khi lấy chi tiết booking, service hiển thị `null` thay vì dữ liệu thực tế
- User bị tính tiền cho service không tồn tại

**Vị trí lỗi:** [backend/src/services/bookingService.js](backend/src/services/bookingService.js)

```javascript
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

  // ❌ MISSING: Không kiểm tra xem serviceIds có tồn tại không!
  // ...code tiếp tục...
};
```

---

### 🔍 Nguyên Nhân (Root Cause)

1. **Thiếu validation**: `serviceIds` được nhận vào nhưng không được kiểm tra
2. **Không query database**: Không check xem service có tồn tại hay không
3. **Thiếu authorization check**: Không check xem service có thể được sử dụng cho barber này không
4. **Lỗi data consistency**: Có thể service bị xóa sau khi booking được tạo

**Ảnh hưởng:**

- Financial loss: user bị tính tiền cho service không tồn tại
- Bad user experience: booking không hoàn chỉnh
- Database inconsistency: foreign key constraints có thể bị vi phạm
- Khó debug: logs không có thông tin rõ về lỗi

---

### ✅ Cách Fix (Solution)

#### **Bước 1:** Update `src/services/bookingService.js` - thêm hàm validate

```javascript
// Thêm hàm này vào bookingService.js
const validateAndGetServices = async (serviceIds) => {
  if (!serviceIds || serviceIds.length === 0) {
    throw new ApiError(400, "At least one service is required");
  }

  // Kiểm tra xem tất cả service có tồn tại không
  const services = await prisma.service.findMany({
    where: {
      id: {
        in: serviceIds,
      },
      deletedAt: null, // Chỉ lấy service chưa bị xóa
    },
  });

  if (services.length !== serviceIds.length) {
    const foundIds = services.map((s) => s.id);
    const missingIds = serviceIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(
      400,
      `The following services do not exist: ${missingIds.join(", ")}`,
    );
  }

  return services;
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

  // ✅ NEW: Validate services exist
  const services = await validateAndGetServices(payload.serviceIds);

  // Check if booking date is not in the past
  const nowInHoChiMinh = getNowInHoChiMinh();
  if (bookingDate < nowInHoChiMinh.date) {
    throw new ApiError(400, "Cannot book in the past");
  }

  // Check if barber exists and is active
  const barber = await prisma.barber.findFirst({
    where: {
      id: resolvedBarberId,
      deletedAt: null,
      isActive: true,
    },
  });

  if (!barber) {
    throw new ApiError(404, "Barber not found or is not active");
  }

  // Check for overlapping bookings
  const existingBookings = await prisma.booking.findMany({
    where: {
      barberId: resolvedBarberId,
      bookingDate,
      status: { in: BOOKABLE_STATUSES },
    },
  });

  const newSlotStart = timeToMinutes(startTime);
  const newSlotEnd = timeToMinutes(endTime);

  for (const existing of existingBookings) {
    if (
      isOverlap(
        startTime,
        endTime,
        formatTimeOnly(existing.startTime),
        formatTimeOnly(existing.endTime),
      )
    ) {
      throw new ApiError(400, "Time slot is already booked");
    }
  }

  // Calculate total price
  const totalAmount = services.reduce((sum, service) => {
    const quantity = payload.serviceQuantities?.[service.id] || 1;
    return sum + service.price * quantity;
  }, 0);

  // Create booking with transaction
  const booking = await prisma.booking.create({
    data: {
      customerId,
      barberId: resolvedBarberId,
      branchId: barber.branchId,
      bookingDate,
      startTime,
      endTime,
      totalAmount,
      notes: payload.notes || null,
      status: "pending",
      bookingServices: {
        create: services.map((service) => {
          const quantity = payload.serviceQuantities?.[service.id] || 1;
          return {
            serviceId: service.id,
            quantity,
            unitPrice: service.price,
            subtotal: service.price * quantity,
          };
        }),
      },
    },
    include: {
      customer: true,
      barber: { include: { user: true, branch: true } },
      bookingServices: { include: { service: true } },
    },
  });

  return serializeBooking(booking);
};
```

#### **Bước 2:** Update validation rule trong `src/validations/bookingValidation.js`

```javascript
const createBookingValidation = [
  body("workerId").optional().isUUID().withMessage("workerId must be valid"),
  body("barberId").optional().isUUID().withMessage("barberId must be valid"),
  body().custom((_, { req }) => {
    if (!req.body.workerId && !req.body.barberId) {
      throw new Error("barberId is required");
    }
    return true;
  }),
  body("bookingDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("bookingDate must be YYYY-MM-DD"),
  body("startTime")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("startTime must be HH:mm"),
  body("endTime")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("endTime must be HH:mm"),
  body("serviceIds")
    .isArray({ min: 1 })
    .withMessage("serviceIds must be a non-empty array"),
  body("serviceIds.*")
    .isUUID()
    .withMessage("Each serviceId must be valid UUID"),
  // ✅ NEW: Validate service quantities (optional)
  body("serviceQuantities").optional().isObject(),
  body("serviceQuantities.*").optional().isInt({ min: 1 }),
  body("notes").optional({ nullable: true, checkFalsy: true }).trim(),
];
```

---

## INCIDENT #4: Không Buộc HTTPS Trong Production - Lỗi Bảo Mật

### 📌 Hiện Tượng (Phenomena)

- Người dùng có thể kết nối qua HTTP (không encrypted)
- JWT tokens được gửi over HTTP có thể bị attacker bắt giữ
- Tất cả dữ liệu cá nhân: email, tên, số điện thoại được truyền unencrypted
- Man-in-the-middle attack có thể xảy ra
- Browser warnings about insecure connection (trên production)

**Vị trí lỗi:**

- [backend/src/app.js](backend/src/app.js)
- [backend/src/server.js](backend/src/server.js)

```javascript
// ❌ Không có middleware buộc HTTPS
app.listen(PORT, () => {
  console.log(` [SERVER] Listening on port: ${PORT}`);
});
```

---

### 🔍 Nguyên Nhân (Root Cause)

1. **Thiếu HTTPS redirect**: Không có middleware redirect HTTP → HTTPS
2. **Thiếu security headers**: Không set `Strict-Transport-Security`
3. **CORS được config quá mở**: Cho phép tất cả origins
4. **Không validate request origin**: Có thể bị CSRF attack

**Ảnh hưởng:**

- **Critical**: Tokens có thể bị đánh cắp
- **Critical**: Passwords không được hashed trong transit
- **High**: User data exposure
- **High**: Session hijacking risk
- Compliance violation: GDPR, PCI-DSS nếu xử lý card payments

---

### ✅ Cách Fix (Solution)

#### **Bước 1:** Update `src/app.js`

```javascript
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const barberRoutes = require("./routes/barberRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ✅ NEW: Middleware buộc HTTPS trong production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    // Nếu sử dụng proxy (như nginx), check X-Forwarded-Proto header
    if (req.header("x-forwarded-proto") !== "https") {
      return res.redirect(`https://${req.header("host")}${req.url}`);
    }
    next();
  });
}

// ✅ NEW: Security headers middleware
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // HTTPS only (HSTS)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  next();
});

// Configure CORS for both deployed frontend and local Docker/SPA development.
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log(" [CORS] Allowed origins:", allowedOrigins);

// ✅ IMPROVED: More restrictive CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests like curl/postman with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  }),
);

app.use(express.json({ limit: "10mb" })); // ✅ NEW: Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ NEW: Rate limiting middleware (prevent brute force)
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api/", limiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/barbers", barberRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.use(errorHandler);

module.exports = app;
```

#### **Bước 2:** Update `package.json` để thêm `express-rate-limit`

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.3.2",
    "jsonwebtoken": "^9.0.3",
    "prisma": "^5.22.0"
  }
}
```

#### **Bước 3:** Update `.env` production settings

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-super-secret-key-here-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here-change-this
FRONTEND_URL=https://yourdomain.com
HTTPS_ONLY=true
```

#### **Bước 4:** Update Docker/Nginx configuration

Trong `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (từ Let's Encrypt hoặc CA khác)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

---

## 📊 Bảng Tóm Tắt Incidents

| #   | Incident                   | Độ Nghiêm Trọng | Loại           | Fix Time |
| --- | -------------------------- | --------------- | -------------- | -------- |
| 1   | Database Graceful Shutdown | **HIGH**        | Infrastructure | 30 min   |
| 2   | JWT Token Refresh          | **HIGH**        | Authentication | 1 hour   |
| 3   | Service Validation         | **CRITICAL**    | Data Integrity | 45 min   |
| 4   | HTTPS Enforcement          | **CRITICAL**    | Security       | 30 min   |

---

## 🚀 Ưu Tiên Fix

### **Giai đoạn 1 (Ngay lập tức):**

- ✅ Incident #4: HTTPS Enforcement (bảo mật tối thiểu)
- ✅ Incident #3: Service Validation (tránh data loss)

### **Giai đoạn 2 (Tuần tiếp theo):**

- ✅ Incident #2: JWT Refresh Token (user experience)
- ✅ Incident #1: Database Graceful Shutdown (stability)

---

## 📝 Testing Checklist

### Incident #1:

```bash
# Test graceful shutdown
docker-compose up -d
# Wait for server to start
curl http://localhost:5000/api/health
# Stop gracefully
docker-compose down
# Check logs for "Database connection closed"
```

### Incident #2:

```bash
# Test token refresh
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token_here>"}'
```

### Incident #3:

```bash
# Test with invalid serviceId
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "barberId": "...",
    "bookingDate": "2025-05-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "serviceIds": ["invalid-uuid-here"]
  }'
# Should return 400 error with message about invalid service
```

### Incident #4:

```bash
# Test HTTPS redirect
curl -i http://yourdomain.com/api/health
# Should return 301 redirect to https://
```

---

**Generated**: May 11, 2026  
**System**: DevOps Booking System v1.0
