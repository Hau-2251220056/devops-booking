import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BarberSelector from "./components/BarberSelector";
import ServiceSelector from "./components/ServiceSelector";
import DateSelector from "./components/DateSelector";
import BookingTimeSlots from "./components/BookingTimeSlots";
import CustomerInfoForm from "./components/CustomerInfoForm";
import BookingSummary from "./components/BookingSummary";
import { fetchServices } from "../../services/serviceApi";
import { fetchBarbers } from "../../services/barberApi";
import { createBooking } from "../../services/bookingApi";
import { validateBookingForm } from "../../utils/validation";
import { useToast } from "../../components/Toast/useToast";
import { useAuth } from "../../contexts/useAuth";
import { formatDateForApi } from "../../utils/dateHelper";
import "./Booking.css";

function BookingPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const barberIdFromUrl = searchParams.get("barberId");

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    note: "",
  });

  // UI state
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotReloadKey, setSlotReloadKey] = useState(0);

  const filteredServices = useMemo(() => {
    if (!selectedBarber?.branchId) {
      return services;
    }

    return services.filter(
      (service) => service.branchId === selectedBarber.branchId,
    );
  }, [services, selectedBarber]);

  const suggestedCustomerInfo = useMemo(() => {
    if (!user) {
      return { fullName: "", phone: "" };
    }

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      fullName,
      phone: user.phone || "",
    };
  }, [user]);

  const effectiveCustomerInfo = useMemo(
    () => ({
      fullName: customerInfo.fullName || suggestedCustomerInfo.fullName,
      phone: customerInfo.phone || suggestedCustomerInfo.phone,
      note: customerInfo.note,
    }),
    [customerInfo, suggestedCustomerInfo],
  );

  const isFormReadyForSubmit = useMemo(
    () =>
      Boolean(
        selectedBarber &&
        selectedService &&
        selectedDate &&
        selectedSlot &&
        effectiveCustomerInfo.fullName?.trim() &&
        effectiveCustomerInfo.phone?.trim(),
      ),
    [
      effectiveCustomerInfo.fullName,
      effectiveCustomerInfo.phone,
      selectedBarber,
      selectedDate,
      selectedService,
      selectedSlot,
    ],
  );

  const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const nextHours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const nextMinutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${nextHours}:${nextMinutes}`;
  };

  // Fetch services and barbers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesResponse, barbersResponse] = await Promise.all([
          fetchServices(),
          fetchBarbers(),
        ]);

        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
        }

        if (barbersResponse.success && barbersResponse.data) {
          setBarbers(barbersResponse.data);
        }

        const defaultBarber =
          (barbersResponse.success &&
            barbersResponse.data?.find(
              (barber) => barber.id === barberIdFromUrl,
            )) ||
          barbersResponse.data?.[0] ||
          null;

        setSelectedBarber(defaultBarber);
      } catch (err) {
        console.error("Error loading booking data:", err);
        setError("Không thể tải dữ liệu đặt lịch. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [barberIdFromUrl]);

  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
    setFormErrors((prev) => ({ ...prev, barber: "" }));
    setSelectedService((currentService) =>
      currentService && currentService.branchId === barber.branchId
        ? currentService
        : null,
    );
    setSelectedTime("");
    setSelectedSlot(null);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setFormErrors((prev) => ({ ...prev, service: "" }));
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setFormErrors((prev) => ({ ...prev, date: "" }));
    setSelectedTime("");
    setSelectedSlot(null);
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time?.start || "");
    setSelectedSlot(time);
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

  const toast = useToast();

  const handleFieldFocus = (fieldName) => {
    setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formData = {
      selectedBarber,
      selectedService,
      selectedDate,
      selectedTime,
      customerInfo: effectiveCustomerInfo,
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

      if (
        !selectedService ||
        selectedService.branchId !== selectedBarber?.branchId
      ) {
        setSubmitStatus("error");
        toast.error("Vui lòng chọn dịch vụ thuộc đúng chi nhánh của thợ.");
        setFormErrors((prev) => ({
          ...prev,
          service: "Vui lòng chọn dịch vụ thuộc đúng chi nhánh của thợ",
        }));
        return;
      }

      const durationMinutes =
        selectedSlot?.durationMinutes ||
        selectedService.durationMinutes ||
        selectedService.duration ||
        0;
      const endTime =
        selectedSlot?.endTime ||
        addMinutesToTime(selectedTime, durationMinutes);

      // Prepare booking data for API
      const bookingData = {
        barberId: selectedBarber.id,
        bookingDate: formatDateForApi(selectedDate),
        startTime: selectedTime,
        endTime,
        serviceIds: [selectedService.id],
        notes: effectiveCustomerInfo.note.trim(),
      };

      // Log booking data to console
      // console.log("Booking data submitted:", bookingData);

      // Call API
      const response = await createBooking(bookingData);
      if (response.success) {
        setSubmitStatus("success");
        toast.success("Đặt lịch thành công! Chúng tôi đã gửi xác nhận.");
        // Reset form after success
        setTimeout(() => {
          setSelectedService(null);
          setSelectedDate(null);
          setSelectedTime("");
          setSelectedSlot(null);
          setSelectedBarber(barbers[0] || null);
          setCustomerInfo({
            fullName: "",
            phone: "",
            note: "",
          });
          setSubmitStatus(null);
        }, 2000);
      } else {
        // Handle known conflict / not available errors gracefully
        setSubmitStatus("error");
        const msg = response.message || "Không thể đặt lịch. Vui lòng thử lại.";
        // If slot not available, show inline error and refresh available slots
        if (
          response.status === 400 &&
          /not available|not available|không khả dụng/i.test(msg)
        ) {
          setFormErrors((prev) => ({ ...prev, time: msg }));
          toast.error(msg);
          setSlotReloadKey((prev) => prev + 1);
          // clear selected time so user must reselect
          setSelectedTime("");
          setSelectedSlot(null);
        } else {
          toast.error(msg);
        }
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      setSubmitStatus("error");
      toast.error("Có lỗi khi gửi yêu cầu đặt lịch. Vui lòng thử lại.");
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
            <p>Chọn thợ, dịch vụ, ngày và giờ phù hợp với bạn</p>
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
                <BarberSelector
                  barbers={barbers}
                  selectedBarber={selectedBarber}
                  onSelectBarber={handleSelectBarber}
                />

                <ServiceSelector
                  services={filteredServices}
                  selectedService={selectedService}
                  onSelectService={handleSelectService}
                />

                <DateSelector
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />

                <BookingTimeSlots
                  selectedDate={selectedDate}
                  workerId={selectedBarber?.id}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSelectTime}
                  reloadKey={slotReloadKey}
                />

                <CustomerInfoForm
                  customerInfo={effectiveCustomerInfo}
                  onUpdateCustomerInfo={handleUpdateCustomerInfo}
                  errors={formErrors}
                  onFieldFocus={handleFieldFocus}
                />

                {/* Submit Button */}
                <div className="submit-section">
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting || !isFormReadyForSubmit}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                  </button>
                </div>
              </div>

              {/* Right Column - Summary Sidebar */}
              <aside className="booking-sidebar">
                <BookingSummary
                  selectedBarber={selectedBarber}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedSlot={selectedSlot}
                  customerInfo={effectiveCustomerInfo}
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
