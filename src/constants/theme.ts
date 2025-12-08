import { useThemeStore } from '../store/useThemeStore';

export const lightTheme = {
  colors: {
    // Background colors
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',

    // Text colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',

    // Primary colors
    primary: '#007AFF',
    primaryLight: '#E3F2FD',
    primaryDark: '#0056B3',

    // Status colors
    success: '#34C759',
    successLight: '#E8F5E9',
    warning: '#FF9500',
    warningLight: '#FFF3E0',
    error: '#FF3B30',
    errorLight: '#FFEBEE',
    info: '#5AC8FA',
    infoLight: '#E1F5FE',

    // Border & Divider
    border: '#E0E0E0',
    divider: '#EEEEEE',

    // Interactive states
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    ripple: 'rgba(0, 0, 0, 0.1)',

    // Specific UI elements
    inputBackground: '#F5F5F5',
    tabBar: '#FFFFFF',
    tabBarInactive: '#8E8E93',
    statusBar: 'dark' as 'light' | 'dark',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    // Background colors
    background: '#121212',
    surface: '#1E1E1E',
    card: '#252525',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textInverse: '#1A1A1A',

    // Primary colors
    primary: '#0A84FF',
    primaryLight: '#1C3A5E',
    primaryDark: '#409CFF',

    // Status colors
    success: '#30D158',
    successLight: '#1C3829',
    warning: '#FF9F0A',
    warningLight: '#3D2E1C',
    error: '#FF453A',
    errorLight: '#3D1C1C',
    info: '#64D2FF',
    infoLight: '#1C3340',

    // Border & Divider
    border: '#3A3A3A',
    divider: '#2C2C2C',

    // Interactive states
    disabled: '#5C5C5C',
    placeholder: '#6C6C6C',
    ripple: 'rgba(255, 255, 255, 0.1)',

    // Specific UI elements
    inputBackground: '#2C2C2C',
    tabBar: '#1C1C1E',
    tabBarInactive: '#8E8E93',
    statusBar: 'light' as const,
  },
};

export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;

/**
 * Hook to get the current theme based on user preference or system setting
 */
export const useTheme = (): Theme => {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  return resolvedTheme === 'dark' ? darkTheme : lightTheme;
};

/**
 * Hook to get just the colors from the current theme
 */
export const useThemeColors = (): ThemeColors => {
  const theme = useTheme();
  return theme.colors;
};

/**
 * Get theme based on color scheme (for non-hook contexts)
 */
export const getTheme = (colorScheme: 'light' | 'dark' | null | undefined): Theme => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
