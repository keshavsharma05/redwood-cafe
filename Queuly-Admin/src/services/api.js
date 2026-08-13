import axios from 'axios';
import API_BASE_URL from '../config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('towncoffee-admin-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Unauthorized - logout and redirect
        localStorage.removeItem('towncoffee-admin-auth');
        window.location.href = '/';
      } else if (status === 403) {
        alert('Forbidden: You do not have permission to perform this action.');
      } else if (status >= 500) {
        alert('Server Error: Please try again later.');
      }
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
