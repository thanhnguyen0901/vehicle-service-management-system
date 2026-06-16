import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true, // sends HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — handle 401 by attempting token refresh once
let isRefreshing = false;
let refreshQueue: Array<(err?: Error) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((err) => {
            if (err) reject(err);
            else resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        return api(original);
      } catch (refreshError) {
        refreshQueue.forEach((cb) => cb(refreshError as Error));
        refreshQueue = [];
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
