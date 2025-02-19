import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    // Don't set these headers on client side - they should be set by the server
    delete config.headers["Access-Control-Allow-Origin"];
    delete config.headers["Access-Control-Allow-Credentials"];
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Handle CORS errors
      console.error("CORS error:", error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
