import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const bookingApiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

bookingApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Create a new booking
 * @param {Object} bookingData - Booking information
 * @returns {Promise} { success, message, data: {} }
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await bookingApiClient.post("/bookings", bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    // Normalize error to a predictable shape
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Unknown error";
    const status = error?.response?.status || 500;
    return { success: false, message, status };
  }
};

/**
 * Get available time slots for a specific date
 * @param {string} date - Date in format YYYY-MM-DD
 * @returns {Promise} { success, message, data: [] }
 */
export const getAvailableSlots = async (date) => {
  try {
    const params = typeof date === "string" ? { date } : date;
    const response = await bookingApiClient.get("/bookings/available-slots", {
      params,
    });
    const payload = response.data;
    if (Array.isArray(payload)) {
      return { success: true, message: "Success", data: payload };
    }

    if (Array.isArray(payload?.data)) {
      return payload;
    }

    return {
      success: Boolean(payload?.success),
      message: payload?.message || "Success",
      data: payload?.data || [],
    };
  } catch (error) {
    console.error("Error fetching available slots:", error);
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message, data: null };
  }
};

export default bookingApiClient;
