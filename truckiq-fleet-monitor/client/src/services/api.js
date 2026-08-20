import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Normalize errors so components can just read `err.message`.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Unexpected network error";
    return Promise.reject(new Error(message));
  }
);

export const vehicleApi = {
  getAll: async (status) => {
    const res = await api.get("/vehicles", { params: status ? { status } : {} });
    return res.data.data;
  },
  getById: async (vehicleId) => {
    const res = await api.get(`/vehicles/${vehicleId}`);
    return res.data.data;
  },
  create: async (payload) => {
    const res = await api.post("/vehicles", payload);
    return res.data.data;
  },
  update: async (vehicleId, payload) => {
    const res = await api.patch(`/vehicles/${vehicleId}`, payload);
    return res.data.data;
  },
  remove: async (vehicleId) => {
    await api.delete(`/vehicles/${vehicleId}`);
  },
  getHistory: async (vehicleId, params = {}) => {
    const res = await api.get(`/vehicles/${vehicleId}/history`, { params });
    return res.data.data;
  },
};

export default api;
