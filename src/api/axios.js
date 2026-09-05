import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// interceptor token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ❌ KHÔNG set application/json cho FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default axiosClient;
