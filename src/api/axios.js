import axios from 'axios';
import { toast } from 'react-toastify';

// Create an Axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Request interceptor to add the token
API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token'); // Get token from localStorage
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`; // Add Authorization header
    }
    return config;
  },
  (error) => {
    toast.error('Request sending error!'); // Show notification on request error
    return Promise.reject(error); // Handle request errors
  }
);

// Response interceptor to handle 401 errors (Unauthorized)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');

    // If token is expired and refresh token exists
    if (error.response) {
      // Handle 401 Unauthorized error
      if (error.response.status === 401) {
        if (!refreshToken) {
            // If no refresh token, log out user
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/';
            toast.error('Session expired. Please log in again.');
            return Promise.reject(error);
        }
    
        if (originalRequest._retry) {
            // Prevent infinite retry loop 
            return Promise.reject(error);
        }
    
        originalRequest._retry = true;
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}token/refresh/`, {
                refresh: refreshToken,
            });
    
            localStorage.setItem('access_token', response.data.access);
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
    
            return API(originalRequest);
        } catch (refreshError) {
            // Clear tokens and log out on refresh failure
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/';
            toast.error('Session expired. Please log in again.');
            return Promise.reject(refreshError);
        }
      }
    // Handle other response errors
    if (error.response.status === 403) {
      toast.error('Access denied!');
    } else if (error.response.status === 500) {
      toast.error('Server error! Please try again later.');
    } else {
      toast.error(`Error: ${error.response.data.detail || 'An error occurred'}`);
    }
  } else {
    // Handle network errors
    toast.error('Connection error with the server. Please try again later!');
  }

    return Promise.reject(error); // Handle all other errors
  }
);

export default API;
