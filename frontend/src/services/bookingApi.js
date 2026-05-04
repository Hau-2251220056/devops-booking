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
    throw error;
  }
};

/**
 * Get available time slots for a specific date
 * @param {string} date - Date in format YYYY-MM-DD
 * @returns {Promise} { success, message, data: [] }
 */
export const getAvailableSlots = async (date) => {
  try {
    const response = await bookingApiClient.get("/bookings/available-slots", {
      params: date,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
};

export default bookingApiClient;
