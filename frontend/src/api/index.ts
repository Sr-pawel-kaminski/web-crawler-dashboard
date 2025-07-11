import axios from "axios";

const API_URL = "http://localhost:8080/api";
const AUTH_TOKEN = "sykell-secret-token";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export const fetchUrls = () => api.get("/urls");
export const addUrl = (address: string) => api.post("/urls", { address });
export const deleteUrl = (id: number) => api.delete(`/urls/${id}`);
export const updateUrl = (id: number, address: string) => api.put(`/urls/${id}`, { address });
export const analyzeUrl = (id: number) => api.post(`/urls/${id}/analyze`);
export const startAnalysis = (id: number) => api.post(`/urls/${id}/start`);
export const stopAnalysis = (id: number) => api.post(`/urls/${id}/stop`);
export const fetchUrlDetails = (id: number) => api.get(`/urls/${id}`); 