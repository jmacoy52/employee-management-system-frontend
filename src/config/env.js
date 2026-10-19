// Central runtime configuration. Values come from REACT_APP_* env vars at build time.
const DEFAULT_API_URL = "https://employee-management-system-backend-vxar.onrender.com";

export const API_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
export const API_TIMEOUT_MS = Number(process.env.REACT_APP_API_TIMEOUT_MS) || 20000;
