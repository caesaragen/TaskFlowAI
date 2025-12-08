import { create } from 'zustand';
import * as authApi from '../services/api/auth';
import * as secureStorage from '../services/storage/secureStorage';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      await secureStorage.saveToken(response.token);
      await secureStorage.saveUserData(response.user);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Login failed',
      });
      throw error;
    }
  },

  // Register action
  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(email, password);
      await secureStorage.saveToken(response.token);
      await secureStorage.saveUserData(response.user);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Registration failed',
      });
      throw error;
    }
  },

  // Logout action
  logout: async () => {
    await secureStorage.clearAllAuthData();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  // Check auth action
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await secureStorage.getToken();
      if (!token) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Try to get cached user data first
      const cachedUser = await secureStorage.getUserData() as User | null;
      
      // Verify token with API
      try {
        const user = await authApi.verifyToken();
        // Update cached user data
        await secureStorage.saveUserData(user);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch {
        // If API verification fails but we have cached data, use it
        // This allows offline access
        if (cachedUser) {
          set({
            user: cachedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error('Token verification failed');
        }
      }
    } catch (error: any) {
      // Clear any corrupted token data
      await secureStorage.clearAllAuthData();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // Clear error action
  clearError: () => {
    set({ error: null });
  },
}));
