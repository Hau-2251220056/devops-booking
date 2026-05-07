import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const adminApiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const fetchAdminStats = async () => {
  try {
    const response = await adminApiClient.get("/admin/stats");
    const payload = response.data;
    const source = payload?.data ?? payload;

    return {
      success: Boolean(payload?.success ?? true),
      message: payload?.message || "Success",
      data: {
        totalUsers: Number(source?.totalUsers ?? 0),
        totalBookings: Number(source?.totalBookings ?? 0),
        pending: Number(source?.pending ?? 0),
        completed: Number(source?.completed ?? 0),
      },
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";

    return {
      success: false,
      message,
      data: null,
    };
  }
};

export default adminApiClient;
