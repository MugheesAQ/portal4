import axios from 'axios';

// In Docker compose, we access the gateway. In local dev, use localhost:8080.
const API_URL = import.meta.env.VITE_API_GATEWAY || '/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem(config.url.includes('/officer') ? 'officer_token' : 'citizen_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
