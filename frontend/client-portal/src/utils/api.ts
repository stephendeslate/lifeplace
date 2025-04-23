// frontend/client-portal/src/utils/api.ts
import axios from "axios";
import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./storage";

// Get base URL based on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    // In production, use relative URL
    // This works since both API and frontend are on the same domain
    return "/api";
  }

  // In development, use the environment variable or default to localhost
  return process.env.REACT_APP_API_URL || "http://localhost:8000/api";
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and not a retry, attempt to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // No refresh token, clear tokens and redirect to login
          clearAuthData();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Get the appropriate API URL for token refresh
        // This needs to be the same as the baseURL logic
        const apiUrl = getBaseUrl();

        // Attempt to refresh the token
        const response = await axios.post(`${apiUrl}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data.access) {
          // Save new tokens
          setTokens(response.data.access, refreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
