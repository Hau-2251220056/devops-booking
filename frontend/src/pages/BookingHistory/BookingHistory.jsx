import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { cancelBooking, getMyBookings } from "../../services/bookingApi";
import BookingCard from "./BookingCard";
import "./BookingHistory.css";

const TABS = {
  all: "All",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
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

const getTodayStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const isPastDate = (dateString) => {
  const bookingDate = parseLocalDate(dateString);
  if (!bookingDate) {
    return false;
  }

  return bookingDate < getTodayStart();
};

const canCancelBooking = (booking) => {
  const cancellableStatus = ["pending", "confirmed"];
  return cancellableStatus.includes(booking?.status) && !isPastDate(booking?.date);
};

const filterBookingsByTab = (bookings, activeTab) => {
  if (!Array.isArray(bookings)) {
    return [];
  }

  const todayStart = getTodayStart();

  return bookings.filter((booking) => {
    const bookingDate = parseLocalDate(booking?.date);
    const isUpcomingDate = bookingDate ? bookingDate >= todayStart : false;

    if (activeTab === TABS.upcoming) {
      return isUpcomingDate && ["pending", "confirmed"].includes(booking?.status);
    }

    if (activeTab === TABS.completed) {
      const isBeforeToday = bookingDate ? bookingDate < todayStart : false;
      return isBeforeToday || booking?.status === "completed";
    }

    if (activeTab === TABS.cancelled) {
      return booking?.status === "cancelled";
    }

    return true;
  });
};

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.all);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const activeTabRef = useRef(TABS.all);

  const loadBookings = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    const response = await getMyBookings();

    if (response.success) {
      const nextBookings = Array.isArray(response.data) ? response.data : [];
      setBookings(nextBookings);
      setFilteredBookings(filterBookingsByTab(nextBookings, activeTabRef.current));
    } else {
      setError(response.message || "Không thể tải lịch sử lịch hẹn.");
      setBookings([]);
      setFilteredBookings([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial fetch uses the default loading state and avoids duplicate state writes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBookings(false);
  }, [loadBookings]);

  const tabEntries = useMemo(
    () => [
      { key: TABS.all, label: "All" },
      { key: TABS.upcoming, label: "Upcoming" },
      { key: TABS.completed, label: "Completed" },
      { key: TABS.cancelled, label: "Cancelled" },
    ],
    [],
  );

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    setError("");

    const response = await cancelBooking(bookingId);

    if (!response.success) {
      setError(response.message || "Không thể hủy lịch hẹn. Vui lòng thử lại.");
      setCancellingId("");
      return;
    }

    // Update local state to keep UI responsive without a full re-fetch.
    setBookings((prev) => {
      const nextBookings = prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "cancelled" } : booking,
      );
      setFilteredBookings(
        filterBookingsByTab(nextBookings, activeTabRef.current),
      );
      return nextBookings;
    });
    setCancellingId("");
  };

  const handleTabChange = (tabKey) => {
    activeTabRef.current = tabKey;
    setActiveTab(tabKey);
    setFilteredBookings(filterBookingsByTab(bookings, tabKey));
  };

  return (
    <>
      <Header />

      <main className="booking-history-page">
        <div className="booking-history-container">
          <header className="booking-history-header">
            <h1>Lịch sử lịch hẹn</h1>
            <p>Theo dõi tất cả lịch hẹn và trạng thái của bạn tại đây.</p>
          </header>

          <section className="booking-history-tabs" aria-label="Booking filters">
            {tabEntries.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`booking-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </section>

          {loading ? (
            <div className="booking-history-state">
              <div className="booking-spinner" />
              <p>Đang tải lịch sử lịch hẹn...</p>
            </div>
          ) : null}

          {!loading && error ? (
            <div className="booking-history-state booking-history-error">
              <p>{error}</p>
              <button
                type="button"
                className="retry-btn"
                onClick={() => loadBookings(true)}
              >
                Tải lại
              </button>
            </div>
          ) : null}

          {!loading && !error ? (
            <section className="booking-history-list" aria-live="polite">
              {filteredBookings.length === 0 ? (
                <div className="booking-history-state booking-history-empty">
                  <p>Bạn chưa có lịch hẹn nào</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    canCancel={canCancelBooking(booking)}
                    isCancelling={cancellingId === booking.id}
                    onCancel={handleCancelBooking}
                  />
                ))
              )}
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default BookingHistory;
