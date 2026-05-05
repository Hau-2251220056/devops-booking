import "./CustomerInfoForm.css";

function CustomerInfoForm({
  customerInfo,
  onUpdateCustomerInfo,
  errors,
  onFieldFocus,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdateCustomerInfo({
      ...customerInfo,
      [name]: value,
    });
  };

  return (
    <div className="booking-section">
      <h2 className="section-title">
        <span className="step-number">5</span>
        Thông tin khách hàng
      </h2>

      <div className="form-group">
        <label htmlFor="fullName" className="form-label">
          Họ tên <span className="required">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          className={`form-input ${errors.fullName ? "error" : ""}`}
          placeholder="Nhập tên của bạn"
          value={customerInfo.fullName}
          onChange={handleChange}
          onFocus={() => onFieldFocus && onFieldFocus("fullName")}
        />
        {errors.fullName && (
          <span className="error-message">{errors.fullName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          Số điện thoại <span className="required">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          className={`form-input ${errors.phone ? "error" : ""}`}
          placeholder="0Dxx xxx xxx"
          value={customerInfo.phone}
          onChange={handleChange}
          onFocus={() => onFieldFocus && onFieldFocus("phone")}
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="note" className="form-label">
          Ghi chú <span className="optional">(tuỳ chọn)</span>
        </label>
        <textarea
          id="note"
          name="note"
          className="form-textarea"
          placeholder="Yêu cầu đặc biệt cho thợ cắt tóc..."
          value={customerInfo.note}
          onChange={handleChange}
          onFocus={() => onFieldFocus && onFieldFocus("note")}
          rows="4"
        />
      </div>
    </div>
  );
}

export default CustomerInfoForm;
