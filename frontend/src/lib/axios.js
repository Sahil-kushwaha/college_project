import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Debug logging
if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL not found, using fallback:", baseURL);
} else {
  console.log("✅ VITE_API_URL loaded:", import.meta.env.VITE_API_URL);
}

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // include cookies in requests
});

// Log all requests for debugging
axiosInstance.interceptors.request.use(request => {
  console.log("📤 Request:", request.method.toUpperCase(), request.url);
  return request;
});

export default axiosInstance;
