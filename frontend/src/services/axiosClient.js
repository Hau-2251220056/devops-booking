// src/apis/axiosClient.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach a request interceptor to automatically add auth token when present
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
