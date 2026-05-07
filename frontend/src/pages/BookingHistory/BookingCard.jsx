import "./BookingCard.css";

const STATUS_META = {
  pending: { label: "Chờ xác nhận", className: "status-pending" },
  confirmed: { label: "Đã xác nhận", className: "status-confirmed" },
  cancellation_pending: {
    label: "Chờ phê duyệt hủy",
    className: "status-cancellation-pending",
  },
  completed: { label: "Hoàn thành", className: "status-completed" },
  cancelled: { label: "Đã hủy", className: "status-cancelled" },
};

const parseLocalDate = (dateString) => {
  const [year, month, day] = String(dateString || "")
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const formatDate = (dateString) => {
  const date = parseLocalDate(dateString);
  if (!date) {
    return "--/--/----";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
};

function BookingCard({ booking, canCancel, isCancelling, onCancel }) {
  const statusMeta = STATUS_META[booking?.status] || {
    label: booking?.status || "Không xác định",
    className: "status-default",
  };

  return (
    <article className="booking-history-card">
      <div className="booking-card-main">
        <div className="booking-row">
          <span className="booking-label">Ngày</span>
          <span className="booking-value">{formatDate(booking?.date)}</span>
        </div>

        <div className="booking-row">
          <span className="booking-label">Giờ</span>
          <span className="booking-value">
            {booking?.startTime || "--:--"} - {booking?.endTime || "--:--"}
          </span>
        </div>

        <div className="booking-row">
          <span className="booking-label">Thợ</span>
          <span className="booking-value">
            {booking?.worker?.name || "Chưa cập nhật"}
          </span>
        </div>

        <div className="booking-row">
          <span className="booking-label">Dịch vụ</span>
          <span className="booking-value">
            {booking?.service?.name || "Chưa cập nhật"}
          </span>
        </div>
      </div>

      <div className="booking-card-actions">
        <span className={`booking-status-pill ${statusMeta.className}`}>
          {statusMeta.label}
        </span>

        {canCancel ? (
          <button
            type="button"
            className="booking-cancel-btn"
            onClick={() => onCancel(booking.id)}
            disabled={isCancelling}
          >
            {isCancelling ? "Đang hủy..." : "Hủy"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default BookingCard;
