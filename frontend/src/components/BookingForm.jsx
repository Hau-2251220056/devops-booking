import React, { useState } from "react";
import { createBooking } from "../api/booking";

void React;

function BookingForm() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!date || !time) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      const payload = { date, time };
      const response = await createBooking(payload);

      // Support both successful responses and normalized failure objects.
      if (response?.success === false) {
        setError(response.message || "Đặt lịch thất bại");
        return;
      }

      setSuccess(response?.message || "Booking created successfully");
    } catch (err) {
      if (err?.response?.status === 409) {
        setError(err?.response?.data?.message || "Time slot already booked");
      } else {
        setError(
          err?.response?.data?.message || err?.message || "Đặt lịch thất bại",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error ? <p>{error}</p> : null}
      {success ? <p>{success}</p> : null}

      <label htmlFor="booking-date">Date</label>
      <input
        id="booking-date"
        data-testid="booking-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={loading}
      />

      <label htmlFor="booking-time">Time</label>
      <input
        id="booking-time"
        data-testid="booking-time"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        disabled={loading}
      />

      <button type="submit" data-testid="booking-submit" disabled={loading}>
        {loading ? "Đang xử lý..." : "Đặt lịch"}
      </button>
    </form>
  );
}

export default BookingForm;
