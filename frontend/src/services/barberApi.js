import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const barberApiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch all barbers
 * @returns {Promise} { success, message, data: [] }
 */
export const fetchBarbers = async () => {
  try {
    const response = await barberApiClient.get("/barbers");
    return response.data;
  } catch (error) {
    console.error("Error fetching barbers:", error);
    throw error;
  }
};

/**
 * Fetch barber by ID
 * @param {string} id - Barber ID
 * @returns {Promise} { success, message, data: {} }
 */
export const fetchBarberById = async (id) => {
  try {
    const response = await barberApiClient.get(`/barbers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching barber ${id}:`, error);
    throw error;
  }
};

export default barberApiClient;
