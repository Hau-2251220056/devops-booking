import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ServiceSelector from "./components/ServiceSelector";
import DateSelector from "./components/DateSelector";
import TimeSelector from "./components/TimeSelector";
import CustomerInfoForm from "./components/CustomerInfoForm";
import BookingSummary from "./components/BookingSummary";
import { fetchServices } from "../../services/serviceApi";
import { createBooking } from "../../services/bookingApi";
import { validateBookingForm } from "../../utils/validation";
import { formatDateForApi } from "../../utils/dateHelper";
import "./Booking.css";

function BookingPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    note: "",
  });

  // UI state
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const response = await fetchServices();
        if (response.success && response.data) {
          setServices(response.data);
        }
      } catch (err) {
        console.error("Error loading services:", err);
        setError("Không thể tải dịch vụ. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setFormErrors((prev) => ({ ...prev, service: "" }));
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setFormErrors((prev) => ({ ...prev, date: "" }));
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    setFormErrors((prev) => ({ ...prev, time: "" }));
  };

  const handleUpdateCustomerInfo = (info) => {
    setCustomerInfo(info);
    setFormErrors((prev) => ({
      ...prev,
      fullName: "",
      phone: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formData = {
      selectedService,
      selectedDate,
      selectedTime,
      customerInfo,
    };

    const validation = validateBookingForm(formData);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setSubmitStatus("error");
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors({});

      // Prepare booking data for API
      const bookingData = {
        serviceId: selectedService.id,
        date: formatDateForApi(selectedDate),
        time: selectedTime,
        customerName: customerInfo.fullName.trim(),
        customerPhone: customerInfo.phone.trim(),
        notes: customerInfo.note.trim(),
      };

      // Log booking data to console
      console.log("Booking data submitted:", bookingData);

      // Call API
      const response = await createBooking(bookingData);

      if (response.success) {
        setSubmitStatus("success");
        // Reset form after success
        setTimeout(() => {
          setSelectedService(null);
          setSelectedDate(null);
          setSelectedTime("");
          setCustomerInfo({
            fullName: "",
            phone: "",
            note: "",
          });
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="booking-page">
          <div className="container">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="booking-page">
          <div className="container">
            <div className="error-container">
              <AlertCircle size={48} />
              <p>{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="booking-page">
        <div className="container">
          <div className="booking-header">
            <h1>Đặt lịch dịch vụ</h1>
            <p>Chọn dịch vụ, ngày và giờ phù hợp với bạn</p>
          </div>

          {/* Alert Messages */}
          {submitStatus === "success" && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <div className="alert-content">
                <p className="alert-title">Đặt lịch thành công!</p>
                <p className="alert-message">
                  Chúng tôi đã nhận được yêu cầu của bạn. Vui lòng kiểm tra
                  email hoặc tin nhắn để xác nhận.
                </p>
              </div>
            </div>
          )}

          {submitStatus === "error" && Object.keys(formErrors).length > 0 && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <div className="alert-content">
                <p className="alert-title">Có lỗi xảy ra</p>
                <ul className="error-list">
                  {Object.entries(formErrors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="booking-main">
              {/* Left Column - Booking Form */}
              <div className="booking-content">
                <ServiceSelector
                  services={services}
                  selectedService={selectedService}
                  onSelectService={handleSelectService}
                />

                <DateSelector
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />

                <TimeSelector
                  selectedTime={selectedTime}
                  onSelectTime={handleSelectTime}
                  disabledSlots={[]}
                />

                <CustomerInfoForm
                  customerInfo={customerInfo}
                  onUpdateCustomerInfo={handleUpdateCustomerInfo}
                  errors={formErrors}
                />

                {/* Submit Button */}
                <div className="submit-section">
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                  </button>
                </div>
              </div>

              {/* Right Column - Summary Sidebar */}
              <aside className="booking-sidebar">
                <BookingSummary
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  customerInfo={customerInfo}
                />
              </aside>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BookingPage;
