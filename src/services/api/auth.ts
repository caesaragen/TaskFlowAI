import { apiClient, handleApiError } from './client';
import { User, AuthResponse } from '../../types/user';

// Mock API for demo - replace with real endpoints
const MOCK_MODE = true;

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 1000));

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  if (MOCK_MODE) {
    await mockDelay();
    // Simple validation
    if (!email || !password) {
      throw new Error('Invalid credentials');
    }
    return {
      user: {
        id: '1',
        email,
        name: 'Demo User',
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-' + Date.now(),
    };
  }

  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  if (MOCK_MODE) {
    await mockDelay();
    return {
      user: {
        id: '1',
        email,
        name,
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-' + Date.now(),
    };
  }

  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const verifyToken = async (token: string): Promise<User> => {
  if (MOCK_MODE) {
    await mockDelay();
    return {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const response = await apiClient.get<User>('/auth/verify');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};