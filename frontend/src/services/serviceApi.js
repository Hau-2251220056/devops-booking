// @ts-nocheck
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const serviceApiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
/**
 * Fetch all services
 * @returns {Promise} { success, message, data: [] }
 */
export const fetchServices = async () => {
  try {
    const response = await serviceApiClient.get("/services");
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

/**
 * Fetch service by ID
 * @param {string} id - Service ID
 * @returns {Promise} { success, message, data: {} }
 */
export const fetchServiceById = async (id) => {
  try {
    const response = await serviceApiClient.get(`/services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    throw error;
  }
};

export default serviceApiClient;
