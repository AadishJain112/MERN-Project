import axios from "axios";

// IMPORTANT:
// - Vite env vars are injected at BUILD time (Render/Vercel/etc).
// - If VITE_API_URL is missing, axios will call the frontend origin by accident and login/register will fail.
// Set this in your frontend deployment environment:
//   VITE_API_URL=https://mern-backend-x969.onrender.com/api
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  // Safe production fallback for your current deployed backend:
  (import.meta.env.PROD
    ? "https://mern-backend-x969.onrender.com/api"
    : "http://localhost:5000/api");

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cdstar_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
