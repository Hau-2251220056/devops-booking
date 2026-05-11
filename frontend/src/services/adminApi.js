import axiosClient from "./axiosClient";

const adminApiClient = axiosClient;

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
