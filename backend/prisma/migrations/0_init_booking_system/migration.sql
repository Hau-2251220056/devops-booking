-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'bank_transfer', 'e_wallet');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE "AuditAction" AS ENUM ('create', 'update', 'delete', 'cancel');

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable "branches"
CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "opening_time" TIME NOT NULL DEFAULT '08:00:00',
    "closing_time" TIME NOT NULL DEFAULT '18:00:00',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "check_time_order" CHECK ("opening_time" < "closing_time")
);

-- CreateIndex
CREATE INDEX "idx_branches_city" ON "branches"("city") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_branches_active" ON "branches"("is_active") WHERE "deleted_at" IS NULL;

-- CreateTable "users"
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone" VARCHAR(20),
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verify_token" VARCHAR(255),
    "verify_token_expires_at" TIMESTAMP(6),
    "reset_token" VARCHAR(255),
    "reset_token_expires_at" TIMESTAMP(6),
    "last_login_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email") WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "users_username_key" ON "users"("username") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_users_role" ON "users"("role") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_users_active" ON "users"("is_active") WHERE "deleted_at" IS NULL;

-- CreateTable "barbers"
CREATE TABLE "barbers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "branch_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "specialization" VARCHAR(255),
    "experience_years" INTEGER CHECK ("experience_years" >= 0),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0 CHECK ("rating" >= 0 AND "rating" <= 5),
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "barbers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_barbers_branch_id" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_barbers_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "barbers_user_id_key" ON "barbers"("user_id");
CREATE INDEX "idx_barbers_branch_id" ON "barbers"("branch_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_barbers_active" ON "barbers"("is_active") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_barbers_available" ON "barbers"("is_available") WHERE "deleted_at" IS NULL;

-- CreateTable "services"
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "branch_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL CHECK ("price" > 0),
    "duration_minutes" INTEGER NOT NULL CHECK ("duration_minutes" > 0),
    "category" VARCHAR(100),
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_services_branch_id" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_services_branch_id" ON "services"("branch_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_services_active" ON "services"("is_active") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_services_category" ON "services"("category") WHERE "deleted_at" IS NULL;

-- CreateTable "time_slots"
CREATE TABLE "time_slots" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "branch_id" UUID NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "duration_minutes" INTEGER NOT NULL CHECK ("duration_minutes" > 0),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "check_time_slot_order" CHECK ("start_time" < "end_time"),
    CONSTRAINT "fk_time_slots_branch_id" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "unique_time_slot_per_branch" UNIQUE ("branch_id", "start_time", "end_time")
);

-- CreateIndex
CREATE INDEX "idx_time_slots_branch_id" ON "time_slots"("branch_id");
CREATE INDEX "idx_time_slots_start_time" ON "time_slots"("start_time");

-- CreateTable "working_hours"
CREATE TABLE "working_hours" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "branch_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL CHECK ("day_of_week" >= 0 AND "day_of_week" <= 6),
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "check_working_hours_order" CHECK ("start_time" < "end_time"),
    CONSTRAINT "fk_working_hours_branch_id" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "unique_working_hours" UNIQUE ("branch_id", "day_of_week")
);

-- CreateIndex
CREATE INDEX "idx_working_hours_branch_id" ON "working_hours"("branch_id");
CREATE INDEX "idx_working_hours_day" ON "working_hours"("day_of_week");

-- CreateTable "bookings"
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "customer_id" UUID NOT NULL,
    "barber_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "booking_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK ("total_amount" >= 0),
    "notes" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "cancellation_reason" TEXT,
    "cancelled_at" TIMESTAMP(6),
    "cancelled_by" UUID,
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_bookings_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_bookings_barber_id" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_bookings_branch_id" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_bookings_cancelled_by" FOREIGN KEY ("cancelled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "check_booking_date_not_past" CHECK ("booking_date" >= CURRENT_DATE),
    CONSTRAINT "check_start_end_time" CHECK ("start_time" < "end_time")
);

-- CreateIndex
CREATE INDEX "idx_bookings_customer_id" ON "bookings"("customer_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_bookings_barber_id" ON "bookings"("barber_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_bookings_branch_id" ON "bookings"("branch_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_bookings_booking_date" ON "bookings"("booking_date") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_bookings_status" ON "bookings"("status") WHERE "deleted_at" IS NULL;

-- CreateIndex - PARTIAL UNIQUE INDEX
CREATE UNIQUE INDEX "unique_barber_time_slot" ON "bookings"("barber_id", "booking_date", "start_time", "end_time") WHERE ("status" IN ('pending', 'confirmed') AND "deleted_at" IS NULL);

-- CreateTable "booking_services"
CREATE TABLE "booking_services" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "booking_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1 CHECK ("quantity" > 0),
    "unit_price" DECIMAL(10,2) NOT NULL CHECK ("unit_price" > 0),
    "subtotal" DECIMAL(10,2) NOT NULL CHECK ("subtotal" > 0),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_services_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_booking_services_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_booking_services_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_booking_services_booking_id" ON "booking_services"("booking_id");
CREATE INDEX "idx_booking_services_service_id" ON "booking_services"("service_id");

-- CreateTable "reviews"
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "booking_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "barber_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "comment" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_booking_id_key" UNIQUE ("booking_id"),
    CONSTRAINT "fk_reviews_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_reviews_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_reviews_barber_id" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_reviews_booking_id" ON "reviews"("booking_id");
CREATE INDEX "idx_reviews_customer_id" ON "reviews"("customer_id");
CREATE INDEX "idx_reviews_barber_id" ON "reviews"("barber_id");
CREATE INDEX "idx_reviews_rating" ON "reviews"("rating");

-- CreateTable "payments"
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "booking_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL CHECK ("amount" > 0),
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "transaction_id" VARCHAR(255),
    "paid_at" TIMESTAMP(6),
    "refunded_at" TIMESTAMP(6),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_payments_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_payments_booking_id" ON "payments"("booking_id");
CREATE INDEX "idx_payments_payment_status" ON "payments"("payment_status");
CREATE INDEX "idx_payments_paid_at" ON "payments"("paid_at");

-- CreateTable "audit_logs"
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_audit_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
