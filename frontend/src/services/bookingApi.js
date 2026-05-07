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

/**
 * Get current user's bookings
 * @returns {Promise<{success: boolean, message: string, data: Array}>}
 */
export const getMyBookings = async () => {
  try {
    const response = await bookingApiClient.get("/bookings/my-bookings");
    const payload = response.data;

    const normalizeWorkerName = (item) => {
      if (item?.worker?.name) {
        return item.worker.name;
      }

      if (item?.barber?.user) {
        const firstName = item.barber.user.firstName || "";
        const lastName = item.barber.user.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) {
          return fullName;
        }
      }

      return "Chưa cập nhật";
    };

    const normalizeServiceName = (item) => {
      if (item?.service?.name) {
        return item.service.name;
      }

      if (
        Array.isArray(item?.bookingServices) &&
        item.bookingServices.length > 0
      ) {
        const serviceNames = item.bookingServices
          .map((bookingService) => bookingService?.service?.name)
          .filter(Boolean);

        if (serviceNames.length > 0) {
          return serviceNames.join(", ");
        }
      }

      return "Chưa cập nhật";
    };

    const normalizeBookings = (rawBookings) =>
      rawBookings.map((item) => ({
        id: item?.id,
        date: item?.date || item?.bookingDate || "",
        startTime: item?.startTime || "",
        endTime: item?.endTime || "",
        status: item?.status || "pending",
        worker: {
          name: normalizeWorkerName(item),
        },
        service: {
          name: normalizeServiceName(item),
        },
      }));

    if (Array.isArray(payload)) {
      return {
        success: true,
        message: "Success",
        data: normalizeBookings(payload),
      };
    }

    const bookings = Array.isArray(payload?.data) ? payload.data : [];

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Success",
      data: normalizeBookings(bookings),
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message, data: [] };
  }
};

/**
 * Cancel booking by id
 * @param {string} bookingId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await bookingApiClient.delete(`/bookings/${bookingId}`);
    const payload = response.data;

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Cancelled successfully",
    };
  } catch (error) {
    // Keep backward compatibility if backend also supports patch cancel route.
    if (error?.response?.status === 404) {
      try {
        const patchResponse = await bookingApiClient.patch(
          `/bookings/${bookingId}/cancel`,
        );
        const patchPayload = patchResponse.data;
        return {
          success: Boolean(patchPayload?.success ?? true),
          message: patchPayload?.message || "Cancelled successfully",
        };
      } catch (patchError) {
        const patchMessage =
          patchError?.response?.data?.message ||
          patchError?.message ||
          "Unknown error";
        return { success: false, message: patchMessage };
      }
    }

    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message };
  }
};

/**
 * Get all bookings (Admin only)
 * @returns {Promise<{success: boolean, message: string, data: Array}>}
 */
export const getAllBookings = async () => {
  try {
    const response = await bookingApiClient.get("/bookings");
    const payload = response.data;

    const normalizeServiceName = (item) => {
      if (item?.service?.name) {
        return item.service.name;
      }

      if (
        Array.isArray(item?.bookingServices) &&
        item.bookingServices.length > 0
      ) {
        const serviceNames = item.bookingServices
          .map((bookingService) => bookingService?.service?.name)
          .filter(Boolean);

        if (serviceNames.length > 0) {
          return serviceNames.join(", ");
        }
      }

      return "Chưa cập nhật";
    };

    const normalizeBookings = (rawBookings) =>
      rawBookings.map((item) => ({
        id: item?.id,
        date: item?.bookingDate || "",
        startTime: item?.startTime || "",
        endTime: item?.endTime || "",
        status: item?.status || "pending",
        user: {
          name:
            item?.customer?.firstName && item?.customer?.lastName
              ? `${item.customer.firstName} ${item.customer.lastName}`.trim()
              : item?.customer?.username || "Chưa cập nhật",
        },
        service: {
          name: normalizeServiceName(item),
        },
      }));

    const bookings = Array.isArray(payload?.data) ? payload.data : [];

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Success",
      data: normalizeBookings(bookings),
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message, data: [] };
  }
};

/**
 * Update booking status (Admin only)
 * @param {string} bookingId
 * @param {string} status - pending, confirmed, completed, cancelled
 * @returns {Promise<{success: boolean, message: string, data?: Object}>}
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await bookingApiClient.patch(
      `/bookings/${bookingId}/status`,
      {
        status,
      },
    );
    const payload = response.data;

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Status updated successfully",
      data: payload?.data,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message };
  }
};

/**
 * Delete booking (Admin)
 * @param {string} bookingId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteBooking = async (bookingId) => {
  try {
    const response = await bookingApiClient.delete(`/bookings/${bookingId}`);
    const payload = response.data;

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Booking deleted successfully",
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message };
  }
};

/**
 * Request cancellation (User or Admin)
 * @param {string} bookingId
 * @param {string} reason - Cancellation reason
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const requestBookingCancellation = async (bookingId, reason = "") => {
  try {
    const response = await bookingApiClient.post(
      `/bookings/${bookingId}/request-cancellation`,
      { reason },
    );
    const payload = response.data;

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Cancellation request sent successfully",
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message };
  }
};

/**
 * Approve cancellation (Admin only)
 * @param {string} bookingId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const approveBookingCancellation = async (bookingId) => {
  try {
    const response = await bookingApiClient.patch(
      `/bookings/${bookingId}/approve-cancellation`,
    );
    const payload = response.data;

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Cancellation approved successfully",
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message };
  }
};

/**
 * Reject cancellation (Admin only)
 * @param {string} bookingId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const rejectBookingCancellation = async (bookingId) => {
  try {
    const response = await bookingApiClient.patch(
      `/bookings/${bookingId}/reject-cancellation`,
    );
    const payload = response.data;

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Cancellation rejected successfully",
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return { success: false, message };
  }
};

export default bookingApiClient;
