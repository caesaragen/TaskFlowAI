import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/auth/LoginScreen';
import { Alert } from 'react-native';

// Spy on Alert.alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the theme hook
jest.mock('../../constants/theme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      primaryLight: '#E3F2FD',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      text: '#1A1A1A',
      textSecondary: '#666666',
      textTertiary: '#999999',
      textInverse: '#FFFFFF',
      background: '#FFFFFF',
      card: '#FFFFFF',
      surface: '#F5F5F5',
      inputBackground: '#F5F5F5',
      border: '#E0E0E0',
      divider: '#EEEEEE',
      disabled: '#BDBDBD',
      placeholder: '#9E9E9E',
      tabBar: '#FFFFFF',
      tabBarInactive: '#8E8E93',
      statusBar: 'dark',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    },
  }),
  Theme: {},
}));

// Mock the auth store
jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => {
    const state = {
      login: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    };
    return selector(state);
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation as never} />
    );

    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('should update email and password inputs', () => {
    const { getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as never} />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should show validation error for empty fields', async () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as never} />
    );

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Validation Error',
        'Email is required'
      );
    });
  });

  it('should navigate to register screen', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as never} />
    );

    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });
});