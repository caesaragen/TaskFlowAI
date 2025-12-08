import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Toast from 'react-native-toast-message';
import * as secureStorage from '../storage/secureStorage';

const API_URL = 'https://recomend-api.onrender.com/api';

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
  let errorMessage: string;
  
  if (error.response) {
    errorMessage = error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    errorMessage = 'Network error. Please check your connection.';
  } else {
    errorMessage = error.message || 'An unexpected error occurred';
  }

  // Show toast notification
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: errorMessage,
    position: 'top',
    visibilityTime: 4000,
  });

  return errorMessage;
};
