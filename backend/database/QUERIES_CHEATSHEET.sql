-- ============================================================================
-- BOOKING SYSTEM - SQL QUERIES CHEAT SHEET
-- ============================================================================
-- Common SQL queries for developers working with the Booking System database

-- ============================================================================
-- 1. BOOKING QUERIES
-- ============================================================================

-- 1.1 Get available slots for a specific date and branch
SELECT 
  ts.id,
  ts.branch_id,
  ts.start_time,
  ts.end_time,
  CASE 
    WHEN COUNT(b.id) > 0 THEN 'BOOKED'
    ELSE 'AVAILABLE'
  END as status,
  COUNT(b.id) as booking_count
FROM time_slots ts
LEFT JOIN bookings b ON ts.branch_id = b.branch_id
  AND ts.start_time = b.start_time
  AND ts.end_time = b.end_time
  AND b.booking_date = '2024-05-20'::DATE
  AND b.status IN ('pending', 'confirmed')
  AND b.deleted_at IS NULL
WHERE ts.branch_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND ts.is_active = true
GROUP BY ts.id, ts.branch_id, ts.start_time, ts.end_time
ORDER BY ts.start_time;

-- 1.2 Check if a barber has conflicting bookings
SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status
FROM bookings b
WHERE b.barber_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND b.booking_date = '2024-05-20'::DATE
  AND b.status IN ('pending', 'confirmed')
  AND b.deleted_at IS NULL
  AND (
    (b.start_time < '10:00'::TIME AND b.end_time > '09:00'::TIME)
  );

-- 1.3 Get all bookings for a specific customer
SELECT 
  b.id,
  b.booking_date,
  b.start_time,
  b.end_time,
  b.status,
  b.total_amount,
  br.name as branch_name,
  u.first_name || ' ' || u.last_name as barber_name,
  STRING_AGG(s.name, ', ') as services
FROM bookings b
JOIN branches br ON b.branch_id = br.id
JOIN barbers bar ON b.barber_id = bar.id
JOIN users u ON bar.user_id = u.id
LEFT JOIN booking_services bs ON b.id = bs.booking_id
LEFT JOIN services s ON bs.service_id = s.id
WHERE b.customer_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND b.deleted_at IS NULL
GROUP BY b.id, br.name, u.first_name, u.last_name
ORDER BY b.booking_date DESC;

-- 1.4 Get upcoming bookings for a barber
SELECT 
  b.id,
  b.booking_date,
  b.start_time,
  b.end_time,
  u_customer.first_name || ' ' || u_customer.last_name as customer_name,
  u_customer.phone as customer_phone,
  b.total_amount,
  b.status
FROM bookings b
JOIN users u_customer ON b.customer_id = u_customer.id
WHERE b.barber_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND b.booking_date >= CURRENT_DATE
  AND b.status IN ('pending', 'confirmed')
  AND b.deleted_at IS NULL
ORDER BY b.booking_date, b.start_time;

-- 1.5 Get completed bookings with reviews
SELECT 
  b.id,
  b.booking_date,
  b.start_time,
  b.end_time,
  u_customer.first_name || ' ' || u_customer.last_name as customer_name,
  r.rating,
  r.comment,
  b.total_amount
FROM bookings b
JOIN users u_customer ON b.customer_id = u_customer.id
LEFT JOIN reviews r ON b.id = r.booking_id
WHERE b.barber_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND b.status = 'completed'
  AND b.deleted_at IS NULL
ORDER BY b.booking_date DESC;

-- ============================================================================
-- 2. PAYMENT QUERIES
-- ============================================================================

-- 2.1 Get pending payments
SELECT 
  p.id,
  b.id as booking_id,
  b.booking_date,
  u.first_name || ' ' || u.last_name as customer_name,
  p.amount,
  p.payment_method,
  p.payment_status,
  p.created_at
FROM payments p
JOIN bookings b ON p.booking_id = b.id
JOIN users u ON b.customer_id = u.id
WHERE p.payment_status = 'pending'
  AND b.booking_date >= CURRENT_DATE
ORDER BY p.created_at DESC;

-- 2.2 Get completed payments for a date range
SELECT 
  DATE_TRUNC('day', p.paid_at) as payment_date,
  p.payment_method,
  COUNT(*) as transaction_count,
  SUM(p.amount) as total_amount
FROM payments p
WHERE p.payment_status = 'completed'
  AND p.paid_at >= '2024-05-01'::DATE
  AND p.paid_at < '2024-06-01'::DATE
GROUP BY DATE_TRUNC('day', p.paid_at), p.payment_method
ORDER BY payment_date DESC;

-- 2.3 Get refunded payments
SELECT 
  p.id,
  b.id as booking_id,
  p.amount,
  p.payment_method,
  p.paid_at,
  p.refunded_at,
  (p.refunded_at - p.paid_at) as refund_time
FROM payments p
JOIN bookings b ON p.booking_id = b.id
WHERE p.payment_status = 'refunded'
ORDER BY p.refunded_at DESC;

-- ============================================================================
-- 3. BARBER QUERIES
-- ============================================================================

-- 3.1 Get barber statistics
SELECT 
  b.id,
  u.first_name || ' ' || u.last_name as barber_name,
  br.name as branch_name,
  COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) as completed_bookings,
  COUNT(CASE WHEN bk.status IN ('pending', 'confirmed') AND bk.booking_date >= CURRENT_DATE THEN 1 END) as upcoming_bookings,
  COUNT(CASE WHEN bk.status = 'cancelled' THEN 1 END) as cancelled_bookings,
  ROUND(AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating ELSE 0 END)::numeric, 2) as average_rating,
  COALESCE(SUM(bk.total_amount), 0) as total_revenue
FROM barbers b
JOIN users u ON b.user_id = u.id
JOIN branches br ON b.branch_id = br.id
LEFT JOIN bookings bk ON b.id = bk.barber_id AND bk.deleted_at IS NULL
LEFT JOIN reviews r ON bk.id = r.booking_id
WHERE b.deleted_at IS NULL
GROUP BY b.id, u.first_name, u.last_name, br.name
ORDER BY total_revenue DESC;

-- 3.2 Get barber availability
SELECT 
  b.id,
  u.first_name || ' ' || u.last_name as barber_name,
  b.is_available,
  b.is_active,
  COUNT(bk.id) as total_bookings,
  b.rating,
  u.phone
FROM barbers b
JOIN users u ON b.user_id = u.id
LEFT JOIN bookings bk ON b.id = bk.barber_id AND bk.deleted_at IS NULL
WHERE b.branch_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND b.deleted_at IS NULL
GROUP BY b.id, u.first_name, u.last_name
ORDER BY b.is_available DESC, b.rating DESC;

-- 3.3 Get barber's busy hours today
SELECT 
  b.id,
  u.first_name || ' ' || u.last_name as barber_name,
  b.start_time,
  b.end_time,
  (b.end_time - b.start_time) as duration
FROM bookings b
JOIN users u ON (SELECT user_id FROM barbers WHERE id = b.barber_id) = u.id
WHERE b.barber_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND b.booking_date = CURRENT_DATE
  AND b.status IN ('pending', 'confirmed')
  AND b.deleted_at IS NULL
ORDER BY b.start_time;

-- ============================================================================
-- 4. SERVICE QUERIES
-- ============================================================================

-- 4.1 Get services by category
SELECT 
  s.id,
  s.name,
  s.description,
  s.price,
  s.duration_minutes,
  s.category,
  s.is_active
FROM services s
WHERE s.branch_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND s.category = 'Haircut'
  AND s.is_active = true
  AND s.deleted_at IS NULL
ORDER BY s.order_index, s.name;

-- 4.2 Get most popular services
SELECT 
  s.id,
  s.name,
  s.price,
  COUNT(bs.id) as booking_count,
  SUM(bs.subtotal) as total_revenue
FROM services s
LEFT JOIN booking_services bs ON s.id = bs.service_id
WHERE s.branch_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND s.deleted_at IS NULL
GROUP BY s.id, s.name, s.price
ORDER BY booking_count DESC;

-- 4.3 Get services with booking history
SELECT 
  s.id,
  s.name,
  s.price,
  DATE_TRUNC('month', b.booking_date) as month,
  COUNT(*) as booking_count,
  SUM(bs.subtotal) as revenue
FROM services s
LEFT JOIN booking_services bs ON s.id = bs.service_id
LEFT JOIN bookings b ON bs.booking_id = b.id
WHERE s.branch_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND s.deleted_at IS NULL
  AND b.status = 'completed'
GROUP BY s.id, s.name, s.price, DATE_TRUNC('month', b.booking_date)
ORDER BY month DESC, revenue DESC;

-- ============================================================================
-- 5. REPORT QUERIES
-- ============================================================================

-- 5.1 Daily revenue report
SELECT 
  b.booking_date::DATE as date,
  br.name as branch_name,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled,
  COALESCE(SUM(b.total_amount), 0) as total_revenue,
  COALESCE(AVG(b.total_amount), 0) as avg_booking_value
FROM bookings b
JOIN branches br ON b.branch_id = br.id
WHERE b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
  AND b.deleted_at IS NULL
GROUP BY b.booking_date::DATE, br.name
ORDER BY b.booking_date DESC;

-- 5.2 Customer acquisition report
SELECT 
  DATE_TRUNC('month', u.created_at)::DATE as signup_month,
  COUNT(*) as new_customers,
  COUNT(DISTINCT bk.id) as first_month_bookings,
  COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) as completed_bookings
FROM users u
LEFT JOIN bookings bk ON u.id = bk.customer_id 
  AND DATE_TRUNC('month', bk.created_at) = DATE_TRUNC('month', u.created_at)
WHERE u.role = 'customer'
  AND u.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', u.created_at)
ORDER BY signup_month DESC;

-- 5.3 Cancellation report
SELECT 
  b.booking_date::DATE as date,
  COUNT(*) as cancelled_count,
  ROUND(100.0 * COUNT(*) / (
    SELECT COUNT(*) FROM bookings 
    WHERE booking_date = b.booking_date 
    AND deleted_at IS NULL
  ), 2) as cancellation_rate,
  STRING_AGG(DISTINCT b.cancellation_reason, '; ') as reasons
FROM bookings b
WHERE b.status = 'cancelled'
  AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
  AND b.deleted_at IS NULL
GROUP BY b.booking_date::DATE
ORDER BY date DESC;

-- 5.4 Customer lifetime value
SELECT 
  u.id,
  u.first_name || ' ' || u.last_name as customer_name,
  u.created_at as signup_date,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
  COALESCE(SUM(b.total_amount), 0) as lifetime_value,
  ROUND(COALESCE(AVG(r.rating), 0), 2) as avg_rating,
  MAX(b.booking_date) as last_booking_date,
  DATEDIFF(day, MAX(b.booking_date), CURRENT_DATE) as days_since_last_booking
FROM users u
LEFT JOIN bookings b ON u.id = b.customer_id AND b.deleted_at IS NULL
LEFT JOIN reviews r ON b.id = r.booking_id
WHERE u.role = 'customer'
  AND u.deleted_at IS NULL
GROUP BY u.id, u.first_name, u.last_name, u.created_at
ORDER BY lifetime_value DESC;

-- ============================================================================
-- 6. MAINTENANCE QUERIES
-- ============================================================================

-- 6.1 Find orphaned records (data integrity check)
-- Users with no corresponding barber but role = 'staff'
SELECT u.id, u.username, u.email
FROM users u
LEFT JOIN barbers b ON u.id = b.user_id
WHERE u.role = 'staff'
  AND b.id IS NULL
  AND u.deleted_at IS NULL;

-- 6.2 Check for duplicate bookings
SELECT 
  barber_id,
  booking_date,
  start_time,
  end_time,
  COUNT(*) as duplicate_count
FROM bookings
WHERE status IN ('pending', 'confirmed')
  AND deleted_at IS NULL
GROUP BY barber_id, booking_date, start_time, end_time
HAVING COUNT(*) > 1;

-- 6.3 Find unpaid bookings past due date
SELECT 
  b.id as booking_id,
  b.booking_date,
  b.total_amount,
  u.first_name || ' ' || u.last_name as customer_name,
  u.phone as customer_phone,
  p.payment_status,
  (CURRENT_DATE - b.booking_date) as days_overdue
FROM bookings b
JOIN users u ON b.customer_id = u.id
LEFT JOIN payments p ON b.id = p.booking_id
WHERE b.booking_date < CURRENT_DATE
  AND b.status IN ('confirmed', 'completed')
  AND (p.payment_status IS NULL OR p.payment_status IN ('pending', 'failed'))
  AND b.deleted_at IS NULL
ORDER BY b.booking_date;

-- 6.4 Archive old bookings (sample for archiving)
-- Create archive table first: CREATE TABLE bookings_archive AS SELECT * FROM bookings WHERE 1=0;
-- Then archive:
INSERT INTO bookings_archive
SELECT * FROM bookings
WHERE booking_date < CURRENT_DATE - INTERVAL '1 year'
  AND status IN ('completed', 'cancelled')
  AND deleted_at IS NULL;

-- 6.5 Database size and statistics
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size('"' || schemaname || '"."' || tablename || '"')) AS size,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('"' || schemaname || '"."' || tablename || '"') DESC;

-- ============================================================================
-- 7. OPTIMIZATION QUERIES
-- ============================================================================

-- 7.1 Rebuild indexes
REINDEX INDEX unique_barber_time_slot;
REINDEX INDEX idx_bookings_status;
REINDEX INDEX idx_bookings_booking_date;

-- 7.2 Vacuum and analyze
VACUUM ANALYZE bookings;
VACUUM ANALYZE booking_services;
VACUUM ANALYZE payments;

-- 7.3 Find slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- ============================================================================
-- 8. AUDIT QUERIES
-- ============================================================================

-- 8.1 Get audit trail for a booking
SELECT 
  al.id,
  u.first_name || ' ' || u.last_name as user_name,
  al.action,
  al.old_values,
  al.new_values,
  al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.entity_type = 'booking'
  AND al.entity_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
ORDER BY al.created_at DESC;

-- 8.2 Track user activities
SELECT 
  al.user_id,
  u.username,
  al.action,
  COUNT(*) as action_count,
  MAX(al.created_at) as last_activity
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY al.user_id, u.username, al.action
ORDER BY last_activity DESC;

-- ============================================================================
-- 9. BULK OPERATIONS (USE WITH CAUTION)
-- ============================================================================

-- 9.1 Cancel all pending bookings for a date
UPDATE bookings
SET status = 'cancelled',
    cancellation_reason = 'Branch closed',
    cancelled_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE booking_date = '2024-05-25'::DATE
  AND status = 'pending'
  AND branch_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
RETURNING id, booking_date, status;

-- 9.2 Update barber rating (recalculate)
UPDATE barbers b
SET rating = (
  SELECT COALESCE(AVG(r.rating), 5.0)
  FROM reviews r
  JOIN bookings bk ON r.booking_id = bk.id
  WHERE bk.barber_id = b.id
    AND bk.status = 'completed'
)
WHERE deleted_at IS NULL;

-- 9.3 Soft delete old audit logs (keep 2 years)
UPDATE audit_logs
SET deleted_at = CURRENT_TIMESTAMP
WHERE created_at < CURRENT_DATE - INTERVAL '2 years'
  AND deleted_at IS NULL;

-- ============================================================================
-- END OF CHEAT SHEET
-- ============================================================================
