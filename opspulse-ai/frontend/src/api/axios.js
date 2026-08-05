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

// Response Interceptor: Redirect to login on token failure
api.interceptors.response.use((response) => response, (error) => {
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
