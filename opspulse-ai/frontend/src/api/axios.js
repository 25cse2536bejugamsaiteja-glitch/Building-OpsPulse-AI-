import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Default to deployed Render backend web service if running on cloud static host
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return 'https://opspulse-ai-backend.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
api.interceptors.response.use((response) => {
  // Catch HTML responses returned by SPA fallback rewrite rules when JSON API was expected
  if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html')) {
    const htmlError = new Error('SPA rewrite returned HTML index page instead of JSON API response');
    htmlError.response = { ...response, status: 404 };
    return Promise.reject(htmlError);
  }
  return response;
}, async (error) => {
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
      const isCloud = typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
      const fallbackBase = isCloud ? 'https://opspulse-ai-backend.onrender.com/api' : 'http://localhost:5000/api';
      const fallbackUrl = `${fallbackBase}${cleanUrl}`;
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
