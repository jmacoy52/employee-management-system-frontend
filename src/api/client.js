import axios from "axios";
import { API_URL, API_TIMEOUT_MS } from "../config/env";

// Single axios instance used for every backend call.
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
});

// Attach the JWT (if any) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session expired or token rejected: clear it and send the user to sign in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hadToken = Boolean(localStorage.getItem("token"));
    const isAuthCall = /\/api\/users\/(login|register)$/.test(error.config?.url || "");
    if (status === 401 && hadToken && !isAuthCall) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export const SERVER_UNAVAILABLE_MESSAGE =
  "Server is waking up or unavailable, try again.";

// Turn an axios error into a message that is safe to show to users.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err) return fallback;
  if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK" || !err.response) {
    return SERVER_UNAVAILABLE_MESSAGE;
  }
  const data = err.response.data || {};
  return data.error || data.message || data.errors?.[0]?.msg || fallback;
}

export default api;
