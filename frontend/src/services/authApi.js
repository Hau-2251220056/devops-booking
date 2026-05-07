// @ts-nocheck
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authApiClient = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to headers if available
authApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Register new user
 * @param {Object} payload - { username, email, password, firstName, lastName, phone }
 * @returns {Promise} { success, message, data: { token, user } }
 */
export const register = async (payload) => {
    try {
        const response = await authApiClient.post('/auth/register', payload);
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Error registering:', error);
        throw error;
    }
};

/**
 * Login user
 * @param {Object} payload - { identifier (email/username), password }
 * @returns {Promise} { success, message, data: { token, user } }
 */
export const login = async (payload) => {
    try {
        const response = await authApiClient.post('/auth/login', payload);
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

/**
 * Get current user profile
 * @returns {Promise} { success, message, data: user }
 */
export const getProfile = async () => {
    try {
        const response = await authApiClient.get('/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

/**
 * Logout user (client-side only)
 */
export const logout = () => {
    localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export default authApiClient;
