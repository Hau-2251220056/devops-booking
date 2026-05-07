import "./BookingManagement.css";

/**
 * BookingTable Component
 * Displays bookings in a table format with actions
 * @param {Array} bookings - List of bookings to display
 * @param {Function} onStatusChange - Callback when status is changed
 * @param {Function} onDelete - Callback when delete button is clicked
 * @param {Function} onApproveCancellation - Callback to approve cancellation
 * @param {Function} onRejectCancellation - Callback to reject cancellation
 * @param {Array} lockedBookingIds - IDs of bookings being processed (disabled)
 */
function BookingTable({
  bookings,
  onStatusChange,
  onDelete,
  onApproveCancellation,
  onRejectCancellation,
  lockedBookingIds = [],
}) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="booking-empty-state">
        <p>No bookings found</p>
      </div>
    );
  }

  /**
   * Get status badge style based on status
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-badge status-pending";
      case "confirmed":
        return "status-badge status-confirmed";
      case "cancellation_pending":
        return "status-badge status-cancellation-pending";
      case "completed":
        return "status-badge status-completed";
      case "cancelled":
        return "status-badge status-cancelled";
      default:
        return "status-badge";
    }
  };

  /**
   * Format time as HH:MM
   */
  const formatTime = (time) => {
    if (!time) return "N/A";
    return time.slice(0, 5); // Extract HH:MM from HH:MM:SS
  };

  /**
   * Format date as YYYY-MM-DD or locale string
   */
  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD
  };

  /**
   * Check if booking can be edited
   */
  const canEdit = (status) => {
    return (
      status !== "completed" &&
      status !== "cancelled" &&
      status !== "cancellation_pending"
    );
  };

  return (
    <div className="booking-table-container">
      <table className="booking-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const isLocked = lockedBookingIds.includes(booking.id);
            const canUpdateStatus = canEdit(booking.status);

            return (
              <tr key={booking.id} className={isLocked ? "row-loading" : ""}>
                <td>{booking.user?.name || "N/A"}</td>
                <td>{booking.service?.name || "N/A"}</td>
                <td>{formatDate(booking.date)}</td>
                <td>
                  {formatTime(booking.startTime)} -{" "}
                  {formatTime(booking.endTime)}
                </td>
                <td>
                  {canUpdateStatus ? (
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        onStatusChange(booking.id, e.target.value)
                      }
                      disabled={isLocked}
                      className="status-select"
                    >
                      <option value="pending">Chờ giải quyết</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  ) : (
                    <span className={getStatusBadgeClass(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  )}
                </td>
                <td>
                  {booking.status === "cancellation_pending" ? (
                    <div className="booking-actions-group">
                      <button
                        onClick={() => onApproveCancellation(booking.id)}
                        disabled={isLocked}
                        className="btn-approve"
                        title="Approve cancellation request"
                      >
                        {isLocked ? "..." : "Phê duyệt"}
                      </button>
                      <button
                        onClick={() => onRejectCancellation(booking.id)}
                        disabled={isLocked}
                        className="btn-reject"
                        title="Reject cancellation request"
                      >
                        {isLocked ? "..." : "Từ chối"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onDelete(booking.id)}
                      disabled={isLocked}
                      className="btn-delete"
                      title="Delete booking"
                    >
                      {isLocked ? "..." : "Xóa"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BookingTable;
