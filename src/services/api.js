import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bakery-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || '';
    // Don't wipe the session on the initial login attempt itself
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('bakery-token');
      localStorage.removeItem('bakery-user');
    }
    return Promise.reject(err);
  }
);

export default api;