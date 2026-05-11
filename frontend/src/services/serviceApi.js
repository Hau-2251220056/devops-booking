// @ts-nocheck
import axiosClient from "./axiosClient";

const serviceApiClient = axiosClient;
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

/**
 * Create a new service
 * @param {object} payload
 */
export const createService = async (payload) => {
  try {
    const response = await serviceApiClient.post(`/services`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

/**
 * Update an existing service
 * @param {string} id
 * @param {object} payload
 */
export const updateService = async (id, payload) => {
  try {
    const response = await serviceApiClient.put(`/services/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a service (soft-delete)
 * @param {string} id
 */
export const deleteService = async (id) => {
  try {
    const response = await serviceApiClient.delete(`/services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw error;
  }
};

export default serviceApiClient;
