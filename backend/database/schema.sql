-- ============================================================================
-- BOOKING SYSTEM - Hệ thống đặt lịch cắt tóc cho Barber Shop
-- PostgreSQL Database Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: branches (Chi nhánh)
-- ============================================================================
-- Hỗ trợ quản lý nhiều chi nhánh barber shop
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    opening_time TIME NOT NULL DEFAULT '08:00:00',
    closing_time TIME NOT NULL DEFAULT '18:00:00',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT check_phone_format CHECK (phone ~ '^\+?[0-9\-\s]{9,}$'),
    CONSTRAINT check_time_order CHECK (opening_time < closing_time)
);

CREATE INDEX idx_branches_city ON branches(city) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_active ON branches(is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE: users (Người dùng - Khách hàng & Admin)
-- ============================================================================
-- Lưu thông tin khách hàng và admin
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'staff')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verify_token VARCHAR(255),
    verify_token_expires_at TIMESTAMP WITH TIME ZONE,
    reset_token VARCHAR(255),
    reset_token_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE: barbers (Thợ cắt tóc)
-- ============================================================================
-- Quản lý thông tin nhân viên barber
CREATE TABLE barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL,
    user_id UUID NOT NULL UNIQUE,
    specialization VARCHAR(255),
    experience_years INTEGER CHECK (experience_years >= 0),
    rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    total_bookings INTEGER DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT fk_barbers_branch_id FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_barbers_user_id FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_barbers_branch_id ON barbers(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_barbers_active ON barbers(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_barbers_available ON barbers(is_available) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE: services (Dịch vụ cắt tóc)
-- ============================================================================
-- Danh sách các dịch vụ cắt tóc/làm đẹp
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT fk_services_branch_id FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_services_branch_id ON services(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_active ON services(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_category ON services(category) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE: time_slots (Khung giờ làm việc)
-- ============================================================================
-- Quản lý các slot thời gian làm việc trong ngày
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_time_slot_order CHECK (start_time < end_time),
    CONSTRAINT fk_time_slots_branch_id FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT unique_time_slot_per_branch UNIQUE (branch_id, start_time, end_time)
);

CREATE INDEX idx_time_slots_branch_id ON time_slots(branch_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);

-- ============================================================================
-- TABLE: working_hours (Giờ làm việc theo ngày trong tuần)
-- ============================================================================
-- Quản lý lịch làm việc theo từng ngày trong tuần
CREATE TABLE working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_working_hours_order CHECK (start_time < end_time),
    CONSTRAINT fk_working_hours_branch_id FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT unique_working_hours UNIQUE (branch_id, day_of_week)
);

CREATE INDEX idx_working_hours_branch_id ON working_hours(branch_id);
CREATE INDEX idx_working_hours_day ON working_hours(day_of_week);

-- ============================================================================
-- TABLE: bookings (Lịch đặt cắt tóc)
-- ============================================================================
-- Bảng chính lưu các booking của khách hàng
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    barber_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT fk_bookings_customer_id FOREIGN KEY (customer_id)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_barber_id FOREIGN KEY (barber_id)
        REFERENCES barbers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_branch_id FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_cancelled_by FOREIGN KEY (cancelled_by)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT check_booking_date_not_past CHECK (booking_date >= CURRENT_DATE),
    CONSTRAINT check_start_end_time CHECK (start_time < end_time)
);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_barber_id ON bookings(barber_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_branch_id ON bookings(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;

-- PARTIAL UNIQUE INDEX: Ngăn chặn trùng lịch cho barber (chỉ pending/confirmed)
CREATE UNIQUE INDEX unique_barber_time_slot 
ON bookings(barber_id, booking_date, start_time, end_time) 
WHERE status IN ('pending', 'confirmed') AND deleted_at IS NULL;

-- ============================================================================
-- TABLE: booking_services (Dịch vụ trong lịch đặt)
-- ============================================================================
-- Liên kết các dịch vụ trong một booking (một booking có thể có nhiều dịch vụ)
CREATE TABLE booking_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    service_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_services_booking_id FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_booking_services_service_id FOREIGN KEY (service_id)
        REFERENCES services(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX idx_booking_services_service_id ON booking_services(service_id);

-- ============================================================================
-- TABLE: reviews (Đánh giá dịch vụ)
-- ============================================================================
-- Khách hàng có thể đánh giá dịch vụ sau khi booking hoàn thành
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    barber_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_booking_id FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_customer_id FOREIGN KEY (customer_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_barber_id FOREIGN KEY (barber_id)
        REFERENCES barbers(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_barber_id ON reviews(barber_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- TABLE: payments (Thanh toán)
-- ============================================================================
-- Quản lý thông tin thanh toán cho các booking
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'e_wallet')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking_id FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- ============================================================================
-- TABLE: audit_logs (Nhật ký kiểm toán)
-- ============================================================================
-- Ghi lại các thay đổi quan trọng trong hệ thống
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'cancel')),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- TRIGGER: Update updated_at timestamp cho mỗi bảng
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON working_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_services_updated_at BEFORE UPDATE ON booking_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER: Cập nhật total_amount của booking khi thêm/sửa booking_services
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_booking_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bookings
    SET total_amount = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM booking_services
        WHERE booking_id = COALESCE(NEW.booking_id, OLD.booking_id)
    )
    WHERE id = COALESCE(NEW.booking_id, OLD.booking_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_booking_total_insert AFTER INSERT ON booking_services
    FOR EACH ROW EXECUTE FUNCTION recalculate_booking_total();

CREATE TRIGGER recalculate_booking_total_update AFTER UPDATE ON booking_services
    FOR EACH ROW EXECUTE FUNCTION recalculate_booking_total();

CREATE TRIGGER recalculate_booking_total_delete AFTER DELETE ON booking_services
    FOR EACH ROW EXECUTE FUNCTION recalculate_booking_total();

-- ============================================================================
-- DỮ LIỆU MẪU (SAMPLE DATA)
-- ============================================================================

-- Insert chi nhánh
INSERT INTO branches (name, address, phone, email, city, district, opening_time, closing_time, is_active)
VALUES 
    ('Barber Shop Downtown', '123 Main Street', '+84912345678', 'downtown@barbershop.com', 'Hà Nội', 'Ba Đình', '08:00:00', '19:00:00', true),
    ('Barber Shop Uptown', '456 Park Avenue', '+84987654321', 'uptown@barbershop.com', 'Hà Nội', 'Cầu Giấy', '09:00:00', '20:00:00', true);

-- Insert người dùng
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role, is_active, is_verified)
VALUES 
    -- Admin
    ('admin', 'admin@barbershop.com', '$2b$10$abc123def456ghi789jkl', 'Admin', 'User', '+84912345678', 'admin', true, true),
    -- Barber 1
    ('barber_john', 'john@barbershop.com', '$2b$10$abc123def456ghi789jkl', 'John', 'Nguyen', '+84912345679', 'staff', true, true),
    -- Barber 2
    ('barber_mike', 'mike@barbershop.com', '$2b$10$abc123def456ghi789jkl', 'Mike', 'Tran', '+84912345680', 'staff', true, true),
    -- Khách hàng 1
    ('customer_1', 'customer1@email.com', '$2b$10$abc123def456ghi789jkl', 'Hùng', 'Lê', '+84912345681', 'customer', true, true),
    -- Khách hàng 2
    ('customer_2', 'customer2@email.com', '$2b$10$abc123def456ghi789jkl', 'Minh', 'Đặng', '+84912345682', 'customer', true, true);

-- Insert barber
INSERT INTO barbers (branch_id, user_id, specialization, experience_years, rating, bio, is_active, is_available)
SELECT 
    b.id,
    u.id,
    'Modern & Fade Haircuts',
    5,
    4.9,
    'Experienced barber with 5 years in the industry',
    true,
    true
FROM branches b, users u
WHERE b.name = 'Barber Shop Downtown' AND u.username = 'barber_john'
LIMIT 1;

INSERT INTO barbers (branch_id, user_id, specialization, experience_years, rating, bio, is_active, is_available)
SELECT 
    b.id,
    u.id,
    'Traditional & Classic Styles',
    7,
    4.8,
    'Master barber with traditional barbering expertise',
    true,
    true
FROM branches b, users u
WHERE b.name = 'Barber Shop Uptown' AND u.username = 'barber_mike'
LIMIT 1;

-- Insert dịch vụ
INSERT INTO services (branch_id, name, description, price, duration_minutes, category, is_active, order_index)
SELECT 
    b.id,
    service_name,
    service_desc,
    service_price,
    service_duration,
    service_category,
    true,
    service_order
FROM branches b
CROSS JOIN (
    VALUES 
        ('Men''s Haircut', 'Classic men''s haircut with scissors', 150000, 30, 'Haircut', 1),
        ('Fade Haircut', 'Modern fade haircut', 180000, 40, 'Haircut', 2),
        ('Beard Trim', 'Professional beard trimming and shaping', 100000, 20, 'Beard', 3),
        ('Hair & Beard Package', 'Haircut + Beard trim combo', 250000, 50, 'Package', 4),
        ('Hair Coloring', 'Hair coloring service', 300000, 60, 'Coloring', 5)
) AS services(service_name, service_desc, service_price, service_duration, service_category, service_order)
WHERE b.name = 'Barber Shop Downtown';

INSERT INTO services (branch_id, name, description, price, duration_minutes, category, is_active, order_index)
SELECT 
    b.id,
    service_name,
    service_desc,
    service_price,
    service_duration,
    service_category,
    true,
    service_order
FROM branches b
CROSS JOIN (
    VALUES 
        ('Men''s Haircut', 'Classic men''s haircut with scissors', 150000, 30, 'Haircut', 1),
        ('Fade Haircut', 'Modern fade haircut', 180000, 40, 'Haircut', 2),
        ('Beard Trim', 'Professional beard trimming and shaping', 100000, 20, 'Beard', 3),
        ('Hair & Beard Package', 'Haircut + Beard trim combo', 250000, 50, 'Package', 4),
        ('Hair Coloring', 'Hair coloring service', 300000, 60, 'Coloring', 5)
) AS services(service_name, service_desc, service_price, service_duration, service_category, service_order)
WHERE b.name = 'Barber Shop Uptown';

-- Insert time slots (10 khung giờ)
INSERT INTO time_slots (branch_id, start_time, end_time, duration_minutes, is_active)
SELECT b.id, time_slot, (time_slot + INTERVAL '30 minutes')::TIME, 30, true
FROM branches b
CROSS JOIN (
    VALUES 
        ('08:00:00'::TIME),
        ('08:30:00'::TIME),
        ('09:00:00'::TIME),
        ('09:30:00'::TIME),
        ('10:00:00'::TIME),
        ('10:30:00'::TIME),
        ('14:00:00'::TIME),
        ('14:30:00'::TIME),
        ('15:00:00'::TIME),
        ('15:30:00'::TIME)
) AS slots(time_slot);

-- Insert working hours (Giờ làm việc theo ngày)
INSERT INTO working_hours (branch_id, day_of_week, start_time, end_time, is_open)
SELECT b.id, day_num, start_hr, end_hr, is_work
FROM branches b
CROSS JOIN (
    VALUES 
        (0, '08:00:00'::TIME, '19:00:00'::TIME, true),    -- Sunday
        (1, '08:00:00'::TIME, '19:00:00'::TIME, true),    -- Monday
        (2, '08:00:00'::TIME, '19:00:00'::TIME, true),    -- Tuesday
        (3, '08:00:00'::TIME, '19:00:00'::TIME, true),    -- Wednesday
        (4, '08:00:00'::TIME, '19:00:00'::TIME, true),    -- Thursday
        (5, '08:00:00'::TIME, '20:00:00'::TIME, true),    -- Friday
        (6, '09:00:00'::TIME, '18:00:00'::TIME, true)     -- Saturday
) AS hours(day_num, start_hr, end_hr, is_work);

-- Insert sample bookings
INSERT INTO bookings (customer_id, barber_id, branch_id, booking_date, start_time, end_time, total_amount, notes, status)
SELECT 
    u.id as customer_id,
    b.id as barber_id,
    br.id as branch_id,
    (CURRENT_DATE + INTERVAL '1 day')::DATE as booking_date,
    '09:00:00'::TIME,
    '09:30:00'::TIME,
    0,
    'Regular haircut',
    'confirmed'
FROM users u, barbers b, branches br
WHERE u.username = 'customer_1' AND br.name = 'Barber Shop Downtown' AND b.branch_id = br.id
LIMIT 1;

INSERT INTO bookings (customer_id, barber_id, branch_id, booking_date, start_time, end_time, total_amount, notes, status)
SELECT 
    u.id as customer_id,
    b.id as barber_id,
    br.id as branch_id,
    (CURRENT_DATE + INTERVAL '2 days')::DATE as booking_date,
    '14:00:00'::TIME,
    '14:50:00'::TIME,
    0,
    'Haircut and beard trim',
    'pending'
FROM users u, barbers b, branches br
WHERE u.username = 'customer_2' AND br.name = 'Barber Shop Uptown' AND b.branch_id = br.id
LIMIT 1;

-- Insert booking_services (Liên kết dịch vụ với booking)
INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, subtotal)
SELECT 
    b.id as booking_id,
    s.id as service_id,
    1 as quantity,
    s.price as unit_price,
    s.price as subtotal
FROM bookings b
JOIN barbers bar ON b.barber_id = bar.id
JOIN branches br ON bar.branch_id = br.id
JOIN services s ON br.id = s.branch_id AND s.name = 'Men''s Haircut'
WHERE b.notes = 'Regular haircut'
LIMIT 1;

INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, subtotal)
SELECT 
    b.id as booking_id,
    s.id as service_id,
    1 as quantity,
    s.price as unit_price,
    s.price as subtotal
FROM bookings b
JOIN barbers bar ON b.barber_id = bar.id
JOIN branches br ON bar.branch_id = br.id
JOIN services s ON br.id = s.branch_id AND s.name = 'Hair & Beard Package'
WHERE b.notes = 'Haircut and beard trim'
LIMIT 1;

-- ============================================================================
-- VIEWS: Các view hỗ trợ query dữ liệu
-- ============================================================================

-- View: Danh sách booking với thông tin chi tiết
CREATE OR REPLACE VIEW view_bookings_detailed AS
SELECT 
    b.id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.total_amount,
    b.status,
    b.notes,
    b.created_at,
    br.name as branch_name,
    u.first_name || ' ' || u.last_name as customer_name,
    u.phone as customer_phone,
    bar_user.first_name || ' ' || bar_user.last_name as barber_name,
    STRING_AGG(s.name, ', ') as services
FROM bookings b
JOIN branches br ON b.branch_id = br.id
JOIN users u ON b.customer_id = u.id
JOIN barbers bar ON b.barber_id = bar.id
JOIN users bar_user ON bar.user_id = bar_user.id
LEFT JOIN booking_services bs ON b.id = bs.booking_id
LEFT JOIN services s ON bs.service_id = s.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, br.name, u.first_name, u.last_name, u.phone, bar_user.first_name, bar_user.last_name;

-- View: Slot còn trống theo ngày
CREATE OR REPLACE VIEW view_available_slots AS
SELECT 
    br.id as branch_id,
    br.name as branch_name,
    ts.id as slot_id,
    ts.start_time,
    ts.end_time,
    ts.duration_minutes,
    CURRENT_DATE::DATE as available_date,
    COUNT(CASE WHEN b.status IN ('pending', 'confirmed') THEN 1 END) as booking_count
FROM branches br
CROSS JOIN time_slots ts
LEFT JOIN bookings b ON br.id = b.branch_id 
    AND ts.start_time = b.start_time 
    AND ts.end_time = b.end_time 
    AND b.booking_date = CURRENT_DATE
WHERE br.is_active = true 
    AND ts.is_active = true
    AND ts.branch_id = br.id
GROUP BY br.id, br.name, ts.id, ts.start_time, ts.end_time, ts.duration_minutes;

-- View: Barber scheduling statistics
CREATE OR REPLACE VIEW view_barber_statistics AS
SELECT 
    bar.id,
    u.first_name || ' ' || u.last_name as barber_name,
    br.name as branch_name,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN b.status IN ('pending', 'confirmed') AND b.booking_date >= CURRENT_DATE THEN 1 END) as upcoming_bookings,
    COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
    ROUND(AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating ELSE 0 END)::numeric, 2) as average_rating,
    COALESCE(SUM(b.total_amount), 0) as total_revenue
FROM barbers bar
JOIN users u ON bar.user_id = u.id
JOIN branches br ON bar.branch_id = br.id
LEFT JOIN bookings b ON bar.id = b.barber_id
LEFT JOIN reviews r ON b.id = r.booking_id
WHERE bar.deleted_at IS NULL AND b.deleted_at IS NULL
GROUP BY bar.id, u.first_name, u.last_name, br.name;
