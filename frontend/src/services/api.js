import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8083',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/session
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Only log non-authentication requests to reduce console spam
    if (!config.url.includes('/users/me')) {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Track if we're already on the login page or home page to prevent redirect loops
const isLoginOrHomePage = () => {
  return window.location.pathname === '/login' || 
         window.location.pathname === '/signup' || 
         window.location.pathname === '/';
};

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Only log non-authentication responses to reduce console spam
    if (!response.config.url.includes('/users/me')) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Handle session expiration or auth errors
    if (error.response) {
      // Check if user just logged out
      const justLoggedOut = sessionStorage.getItem('justLoggedOut') === 'true';
      
      if (error.response.status === 401 && !isLoginOrHomePage() && !justLoggedOut) {
        // Only redirect to login if we're not already on a login/home page and not just logged out
        window.location.href = '/login';
      }
      
      // Log detailed error information for debugging
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url,
        method: error.config.method,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 