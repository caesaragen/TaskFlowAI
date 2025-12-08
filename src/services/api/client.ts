import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as secureStorage from '../storage/secureStorage';

const API_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.taskflowai.com';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await secureStorage.deleteToken();
      // Optionally trigger logout action
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred';
};
