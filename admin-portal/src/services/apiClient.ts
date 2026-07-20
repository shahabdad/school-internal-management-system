import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';
import { storage } from '../utils/storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Authorization Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatic 401 token refresh retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );
        if (refreshRes.data?.accessToken) {
          storage.setToken(refreshRes.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${refreshRes.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        storage.clearAll();
        window.dispatchEvent(new Event('logout-user'));
      }
    }
    return Promise.reject(error);
  }
);
