import { apiClient, handleApiError } from './client';
import { User, AuthResponse } from '../../types/user';

// API Response interfaces
interface ApiAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    provider: string;
  };
}

// Transform API response to app's AuthResponse format
const transformAuthResponse = (apiResponse: ApiAuthResponse): AuthResponse => {
  return {
    token: apiResponse.token,
    user: {
      id: apiResponse.user.id,
      email: apiResponse.user.email,
      name: apiResponse.user.username,
      createdAt: new Date().toISOString(),
    },
  };
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const response = await apiClient.post<ApiAuthResponse>('/auth/login', {
      email,
      password,
    });
    return transformAuthResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const register = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  try {
    const response = await apiClient.post<ApiAuthResponse>('/auth/register', {
      email,
      password,
    });
    return transformAuthResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const verifyToken = async (): Promise<User> => {
  try {
    const response = await apiClient.get<ApiAuthResponse>('/auth/me');
    return transformAuthResponse(response.data).user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};