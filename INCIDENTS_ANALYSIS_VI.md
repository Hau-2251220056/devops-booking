# 🔴 BÁO CÁO PHÂN TÍCH INCIDENTS - DevOps Booking System

## 5.3 INCIDENTS

---

## Incident 1 — User gọi nhầm API Admin

### 📌 Hiện Tượng

Người dùng thực hiện thao tác hủy lịch hẹn trên giao diện user nhưng hệ thống trả về lỗi. Người dùng không thể hủy lịch mặc dù đã đăng nhập.

### 📋 Log

```
403 Forbidden: admin access required
```

### 📍 Layer

**L4 - Frontend**

### 🔍 Nguyên Nhân

Frontend gọi nhầm API xóa booking dành cho admin thay vì API request cancellation của user.

### ✅ Cách Fix

Sửa component hủy lịch để gọi đúng endpoint: `POST /bookings/:id/request-cancellation`

**Vị trí fix:**

```javascript
// ❌ SAI - gọi admin API
DELETE /api/bookings/:id

// ✅ ĐÚNG - gọi user API
POST /api/bookings/:id/request-cancellation
```

### 🛡️ Cách Phòng Tránh

- ✅ Tách rõ API cho user/admin bằng cách đặt namespace riêng (`/api/user/bookings`, `/api/admin/bookings`)
- ✅ Kiểm tra quyền truy cập (authorization) trước khi gọi API
- ✅ Test thủ công các flow role-based (user cancellation vs admin deletion)

---

## Incident 2 — Prisma Client sai hệ điều hành khi build Docker

### 📌 Hiện Tượng

Backend container khởi động thất bại khi chạy Docker Compose. Container báo lỗi Prisma Client không tương thích hệ điều hành.

### 📋 Log

```
Prisma Client was generated for "windows",
but the actual deployment required "debian-openssl-3.0.x"
```

### 📍 Layer

**L1 — Infrastructure / Docker**

### 🔍 Nguyên Nhân

Prisma Client được generate trên Windows (máy local) nhưng Docker container chạy Linux Debian. Binary Prisma không tương thích giữa hai môi trường.

### ✅ Cách Fix

#### Bước 1: Cập nhật `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

#### Bước 2: Regenerate Prisma Client

```bash
npx prisma generate
```

#### Bước 3: Build lại Docker

```bash
docker compose up --build
```

### 🛡️ Cách Phòng Tránh

- ✅ Generate Prisma Client đúng môi trường deploy (sử dụng Docker để generate nếu deploy trên Linux)
- ✅ Luôn sử dụng `binaryTargets` trong schema.prisma để hỗ trợ multi-platform
- ✅ Kiểm tra compatibility giữa local OS và container OS trước khi deploy

---

## Incident 3 — Frontend timeout khi gọi API production

### 📌 Hiện Tượng

Frontend production trên Vercel tải dữ liệu chậm hoặc không hiển thị dữ liệu dịch vụ và thợ cắt tóc.

**Thông báo lỗi:**

- "Không thể tải dịch vụ. Vui lòng thử lại"
- "Không thể tải danh sách thợ cắt tóc"

### 📋 Log

```
AxiosError: timeout of 10000ms exceeded
```

### 📍 Layer

**L1 — Infrastructure**

### 🔍 Nguyên Nhân

Backend được deploy trên **Render free tier** nên service có thể chuyển sang trạng thái **sleep** khi không có request trong một khoảng thời gian.

**Quá trình gây lỗi:**

1. Frontend (Vercel) gửi request đầu tiên đến backend (Render)
2. Backend container ở trạng thái sleep, cần thời gian khởi động lại
3. Thời gian phản hồi vượt quá timeout của Axios (10 giây)
4. Frontend nhận lỗi `timeout` và hiển thị message lỗi

### ✅ Cách Fix

#### Tạm thời:

- Tăng timeout Axios từ 10 giây lên 30-60 giây
- Reload trang để gửi request mới (lần thứ 2 thường thành công vì backend đã khởi động)

#### Dài hạn:

- Nâng cấp lên plan trả phí (ngoài sleep restriction)
- Sử dụng dịch vụ hosting khác (Heroku, Railway, Hetzner, etc.)

### 🛡️ Cách Phòng Tránh

- ✅ Cấu hình health check định kỳ để giữ backend awake
- ✅ Sử dụng hosting không có giới hạn sleep (tránh free tier)
- ✅ Theo dõi monitoring/deploy logs để phát hiện vấn đề sớm
- ✅ Implement retry logic trên frontend (tự động retry nếu timeout)
- ✅ Cache data trên client để giảm dependency vào backend

---

## 📊 Bảng Tóm Tắt

| #   | Incident           | Độ Nghiêm Trọng | Layer          | Fix Time |
| --- | ------------------ | --------------- | -------------- | -------- |
| 1   | API nhầm lẫn       | **HIGH**        | Frontend       | 30 min   |
| 2   | Prisma OS mismatch | **CRITICAL**    | Docker         | 15 min   |
| 3   | Backend timeout    | **HIGH**        | Infrastructure | 1 hour   |

---

## 🚀 Ưu Tiên Fix

### **Giai đoạn 1 (Ngay lập tức):**

- ✅ Incident #2: Prisma Client (blocking deployment)
- ✅ Incident #1: API endpoints (critical bug)

### **Giai đoạn 2 (Tuần tiếp theo):**

- ✅ Incident #3: Backend timeout (infrastructure upgrade)

---

**Generated**: May 12, 2026  
**System**: DevOps Booking System v1.0
