/**
 * Vietnam phone number validation
 * Format: 0XXX-XXXX-XXX or +84XXX-XXXX-XXX
 */
export const validateVietnamesePhone = (phone) => {
  const vietnamPhoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return vietnamPhoneRegex.test(phone?.replace(/\s|-/g, ""));
};

/**
 * Validate full name (at least 2 characters, no numbers)
 */
export const validateFullName = (name) => {
  const nameRegex = /^[a-zA-ZÀ-ỿ\s]{2,}$/;
  return nameRegex.test(name?.trim());
};

/**
 * Validate booking form
 * Returns object with isValid and errors
 */
export const validateBookingForm = (formData) => {
  const errors = {};

  if (!formData.selectedService) {
    errors.service = "Vui lòng chọn dịch vụ";
  }

  if (!formData.selectedDate) {
    errors.date = "Vui lòng chọn ngày";
  }

  if (!formData.selectedTime) {
    errors.time = "Vui lòng chọn giờ";
  }

  if (!formData.customerInfo.fullName?.trim()) {
    errors.fullName = "Vui lòng nhập họ tên";
  } else if (!validateFullName(formData.customerInfo.fullName)) {
    errors.fullName = "Họ tên không hợp lệ (tối thiểu 2 ký tự)";
  }

  if (!formData.customerInfo.phone?.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!validateVietnamesePhone(formData.customerInfo.phone)) {
    errors.phone = "Số điện thoại không hợp lệ (định dạng: 0XXXXXXXXX)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
