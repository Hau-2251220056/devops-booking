import { Calendar, Clock, User, DollarSign } from "lucide-react";
import { formatDisplayDate } from "../../../utils/dateHelper";
import "./BookingSummary.css";

function BookingSummary({
  selectedService,
  selectedDate,
  selectedTime,
  customerInfo,
}) {
  return (
    <div className="booking-summary-sidebar">
      <h3 className="summary-title">Tóm tắt đặt lịch</h3>

      <div className="summary-content">
        {/* Service */}
        <div className="summary-item">
          <div className="summary-header">
            <span className="item-label">Dịch vụ</span>
          </div>
          {selectedService ? (
            <div className="summary-value">
              <p className="service-name">{selectedService.name}</p>
              <p className="service-duration">
                {selectedService.duration} phút
              </p>
            </div>
          ) : (
            <p className="summary-empty">Chưa chọn</p>
          )}
        </div>

        {/* Date */}
        <div className="summary-item">
          <div className="summary-header">
            <Calendar size={16} />
            <span className="item-label">Ngày</span>
          </div>
          {selectedDate ? (
            <p className="summary-value">{formatDisplayDate(selectedDate)}</p>
          ) : (
            <p className="summary-empty">Chưa chọn</p>
          )}
        </div>

        {/* Time */}
        <div className="summary-item">
          <div className="summary-header">
            <Clock size={16} />
            <span className="item-label">Giờ</span>
          </div>
          {selectedTime ? (
            <p className="summary-value">{selectedTime}</p>
          ) : (
            <p className="summary-empty">Chưa chọn</p>
          )}
        </div>

        {/* Customer Name */}
        {customerInfo.fullName && (
          <div className="summary-item">
            <div className="summary-header">
              <User size={16} />
              <span className="item-label">Khách hàng</span>
            </div>
            <p className="summary-value">{customerInfo.fullName}</p>
          </div>
        )}

        {/* Total Price */}
        {selectedService && (
          <div className="summary-item summary-total">
            <div className="summary-header">
              <DollarSign size={16} />
              <span className="item-label">Tổng cộng</span>
            </div>
            <p className="total-price">
              {selectedService.price?.toLocaleString("vi-VN")}đ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingSummary;
