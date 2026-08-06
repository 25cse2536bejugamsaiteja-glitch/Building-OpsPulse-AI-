import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opspulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Support retry with direct backend URL if proxy fails, and handle auth redirects
api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  if (
    originalRequest &&
    !originalRequest._retry &&
    (error.code === 'ERR_NETWORK' || error.response?.status === 404) &&
    originalRequest.url &&
    !originalRequest.url.startsWith('http')
  ) {
    originalRequest._retry = true;
    try {
      const cleanUrl = originalRequest.url.startsWith('/') ? originalRequest.url : `/${originalRequest.url}`;
      const fallbackUrl = `http://localhost:5000/api${cleanUrl}`;
      const fallbackResponse = await axios({
        ...originalRequest,
        url: fallbackUrl
      });
      return fallbackResponse;
    } catch (fallbackErr) {
      return Promise.reject(fallbackErr);
    }
  }

  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    // If not already on login page
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('opspulse_token');
      localStorage.removeItem('opspulse_user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default api;
