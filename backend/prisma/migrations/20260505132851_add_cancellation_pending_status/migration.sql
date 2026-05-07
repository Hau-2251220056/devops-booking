/*
  Warnings:

  - A unique constraint covering the columns `[barber_id,booking_date,start_time,end_time]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'cancellation_pending';

-- AlterTable
ALTER TABLE "barbers" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "booking_services" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "branches" ALTER COLUMN "opening_time" SET DEFAULT '08:00:00'::time,
ALTER COLUMN "closing_time" SET DEFAULT '18:00:00'::time,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "time_slots" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "working_hours" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "barbers_branch_id_idx" ON "barbers"("branch_id");

-- CreateIndex
CREATE INDEX "barbers_is_active_idx" ON "barbers"("is_active");

-- CreateIndex
CREATE INDEX "barbers_is_available_idx" ON "barbers"("is_available");

-- CreateIndex
CREATE INDEX "bookings_customer_id_idx" ON "bookings"("customer_id");

-- CreateIndex
CREATE INDEX "bookings_barber_id_idx" ON "bookings"("barber_id");

-- CreateIndex
CREATE INDEX "bookings_branch_id_idx" ON "bookings"("branch_id");

-- CreateIndex
CREATE INDEX "bookings_booking_date_idx" ON "bookings"("booking_date");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_barber_id_booking_date_start_time_end_time_key" ON "bookings"("barber_id", "booking_date", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "branches_city_idx" ON "branches"("city");

-- CreateIndex
CREATE INDEX "branches_is_active_idx" ON "branches"("is_active");

-- CreateIndex
CREATE INDEX "services_branch_id_idx" ON "services"("branch_id");

-- CreateIndex
CREATE INDEX "services_is_active_idx" ON "services"("is_active");

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category");

-- CreateIndex
-- CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
-- CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- RenameForeignKey
ALTER TABLE "audit_logs" RENAME CONSTRAINT "fk_audit_logs_user_id" TO "audit_logs_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "barbers" RENAME CONSTRAINT "fk_barbers_branch_id" TO "barbers_branch_id_fkey";

-- RenameForeignKey
ALTER TABLE "barbers" RENAME CONSTRAINT "fk_barbers_user_id" TO "barbers_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "booking_services" RENAME CONSTRAINT "fk_booking_services_booking_id" TO "booking_services_booking_id_fkey";

-- RenameForeignKey
ALTER TABLE "booking_services" RENAME CONSTRAINT "fk_booking_services_service_id" TO "booking_services_service_id_fkey";

-- RenameForeignKey
ALTER TABLE "bookings" RENAME CONSTRAINT "fk_bookings_barber_id" TO "bookings_barber_id_fkey";

-- RenameForeignKey
ALTER TABLE "bookings" RENAME CONSTRAINT "fk_bookings_branch_id" TO "bookings_branch_id_fkey";

-- RenameForeignKey
ALTER TABLE "bookings" RENAME CONSTRAINT "fk_bookings_cancelled_by" TO "bookings_cancelled_by_fkey";

-- RenameForeignKey
ALTER TABLE "bookings" RENAME CONSTRAINT "fk_bookings_customer_id" TO "bookings_customer_id_fkey";

-- RenameForeignKey
ALTER TABLE "payments" RENAME CONSTRAINT "fk_payments_booking_id" TO "payments_booking_id_fkey";

-- RenameForeignKey
ALTER TABLE "reviews" RENAME CONSTRAINT "fk_reviews_barber_id" TO "reviews_barber_id_fkey";

-- RenameForeignKey
ALTER TABLE "reviews" RENAME CONSTRAINT "fk_reviews_booking_id" TO "reviews_booking_id_fkey";

-- RenameForeignKey
ALTER TABLE "reviews" RENAME CONSTRAINT "fk_reviews_customer_id" TO "reviews_customer_id_fkey";

-- RenameForeignKey
ALTER TABLE "services" RENAME CONSTRAINT "fk_services_branch_id" TO "services_branch_id_fkey";

-- RenameForeignKey
ALTER TABLE "time_slots" RENAME CONSTRAINT "fk_time_slots_branch_id" TO "time_slots_branch_id_fkey";

-- RenameForeignKey
ALTER TABLE "working_hours" RENAME CONSTRAINT "fk_working_hours_branch_id" TO "working_hours_branch_id_fkey";

-- RenameIndex
ALTER INDEX "idx_audit_logs_action" RENAME TO "audit_logs_action_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_created_at" RENAME TO "audit_logs_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_entity" RENAME TO "audit_logs_entity_type_entity_id_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_user_id" RENAME TO "audit_logs_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_booking_services_booking_id" RENAME TO "booking_services_booking_id_idx";

-- RenameIndex
ALTER INDEX "idx_booking_services_service_id" RENAME TO "booking_services_service_id_idx";

-- RenameIndex
ALTER INDEX "idx_payments_booking_id" RENAME TO "payments_booking_id_idx";

-- RenameIndex
ALTER INDEX "idx_payments_paid_at" RENAME TO "payments_paid_at_idx";

-- RenameIndex
ALTER INDEX "idx_payments_payment_status" RENAME TO "payments_payment_status_idx";

-- RenameIndex
ALTER INDEX "idx_reviews_barber_id" RENAME TO "reviews_barber_id_idx";

-- RenameIndex
ALTER INDEX "idx_reviews_booking_id" RENAME TO "reviews_booking_id_idx";

-- RenameIndex
ALTER INDEX "idx_reviews_customer_id" RENAME TO "reviews_customer_id_idx";

-- RenameIndex
ALTER INDEX "idx_reviews_rating" RENAME TO "reviews_rating_idx";

-- RenameIndex
ALTER INDEX "idx_time_slots_branch_id" RENAME TO "time_slots_branch_id_idx";

-- RenameIndex
ALTER INDEX "idx_time_slots_start_time" RENAME TO "time_slots_start_time_idx";

-- RenameIndex
ALTER INDEX "unique_time_slot_per_branch" RENAME TO "time_slots_branch_id_start_time_end_time_key";

-- RenameIndex
ALTER INDEX "idx_working_hours_branch_id" RENAME TO "working_hours_branch_id_idx";

-- RenameIndex
ALTER INDEX "idx_working_hours_day" RENAME TO "working_hours_day_of_week_idx";

-- RenameIndex
ALTER INDEX "unique_working_hours" RENAME TO "working_hours_branch_id_day_of_week_key";
