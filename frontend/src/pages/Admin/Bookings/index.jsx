import { useState, useEffect, useCallback } from "react";
import {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  approveBookingCancellation,
  rejectBookingCancellation,
} from "../../../services/bookingApi";
import BookingTable from "./BookingTable";
import "./BookingManagement.css";

/**
 * BookingManagement Component
 * Main page for admin to manage all bookings
 * Features: View, Filter, Update Status, Delete
 */
function BookingManagement() {
  // State management
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [lockedBookingIds, setLockedBookingIds] = useState([]);

  /**
   * Fetch all bookings from API
   */
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllBookings();

      if (response.success && Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        setError(response.message || "Failed to fetch bookings");
        setBookings([]);
      }
    } catch {
      setError("An unexpected error occurred while fetching bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Apply filters to bookings
   */
  const applyFilters = useCallback((allBookings, statusFilter, dateFilter) => {
    let filtered = allBookings;

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((booking) => booking.date === dateFilter);
    }

    setFilteredBookings(filtered);
  }, []);

  /**
   * Handle status change
   */
  const handleStatusChange = async (bookingId, newStatus) => {
    setLockedBookingIds((prev) => [...prev, bookingId]);

    try {
      const response = await updateBookingStatus(bookingId, newStatus);

      if (response.success) {
        // Update local state
        const updatedBookings = bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: newStatus }
            : booking,
        );
        setBookings(updatedBookings);
        applyFilters(updatedBookings, selectedStatus, selectedDate);
      } else {
        setError(response.message || "Failed to update booking status");
      }
    } catch {
      setError("An unexpected error occurred while updating status");
    } finally {
      setLockedBookingIds((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  /**
   * Handle delete booking
   */
  const handleDeleteBooking = async (bookingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    setLockedBookingIds((prev) => [...prev, bookingId]);

    try {
      const response = await deleteBooking(bookingId);

      if (response.success) {
        // Refetch data from server to ensure booking is deleted
        await fetchBookings();
      } else {
        setError(response.message || "Failed to delete booking");
      }
    } catch {
      setError("An unexpected error occurred while deleting booking");
    } finally {
      setLockedBookingIds((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  /**
   * Handle approve cancellation request
   */
  const handleApproveCancellation = async (bookingId) => {
    const confirmApprove = window.confirm(
      "Are you sure you want to approve this cancellation request?",
    );

    if (!confirmApprove) return;

    setLockedBookingIds((prev) => [...prev, bookingId]);

    try {
      const response = await approveBookingCancellation(bookingId);

      if (response.success) {
        // Refetch data from server
        await fetchBookings();
      } else {
        setError(response.message || "Failed to approve cancellation");
      }
    } catch {
      setError("An unexpected error occurred while approving cancellation");
    } finally {
      setLockedBookingIds((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  /**
   * Handle reject cancellation request
   */
  const handleRejectCancellation = async (bookingId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this cancellation request?",
    );

    if (!confirmReject) return;

    setLockedBookingIds((prev) => [...prev, bookingId]);

    try {
      const response = await rejectBookingCancellation(bookingId);

      if (response.success) {
        // Refetch data from server
        await fetchBookings();
      } else {
        setError(response.message || "Failed to reject cancellation");
      }
    } catch {
      setError("An unexpected error occurred while rejecting cancellation");
    } finally {
      setLockedBookingIds((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    applyFilters(bookings, newStatus, selectedDate);
  };

  /**
   * Handle date filter change
   */
  const handleDateFilterChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    applyFilters(bookings, selectedStatus, newDate);
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setSelectedStatus("");
    setSelectedDate("");
    setFilteredBookings(bookings);
  };

  /**
   * Fetch bookings on component mount
   */
  useEffect(() => {
    // eslint-disable-next-line
    fetchBookings();
  }, [fetchBookings]);

  /**
   * Apply filters when bookings change
   */
  useEffect(() => {
    // eslint-disable-next-line
    applyFilters(bookings, selectedStatus, selectedDate);
  }, [bookings, selectedStatus, selectedDate, applyFilters]);

  return (
    <section className="booking-management">
      <div className="booking-management-header">
        <h1>Booking Management</h1>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="btn-refresh"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="alert-close">
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="booking-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Lọc:</label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ giải quyết</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter">Lọc theo ngày:</label>
          <input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={handleDateFilterChange}
            className="filter-input"
          />
        </div>

        <button onClick={handleClearFilters} className="btn-clear-filters">
          Xóa bộ lọc
        </button>
      </div>

      {/* Stats */}
      <div className="booking-stats">
        <div className="stat-item">
          <span className="stat-label">Tổng:</span>
          <span className="stat-value">{bookings.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Hiển thị:</span>
          <span className="stat-value">{filteredBookings.length}</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div className="loading-spinner">Loading bookings...</div>}

      {/* Table */}
      {!loading && (
        <BookingTable
          bookings={filteredBookings}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteBooking}
          onApproveCancellation={handleApproveCancellation}
          onRejectCancellation={handleRejectCancellation}
          lockedBookingIds={lockedBookingIds}
        />
      )}
    </section>
  );
}

export default BookingManagement;
