import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const THEME_STORAGE_KEY = '@taskflow_theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  isLoading: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const resolveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return Appearance.getColorScheme() ?? 'light';
  }
  return mode;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  resolvedTheme: resolveTheme('system'),
  isLoading: true,

  setThemeMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({
        mode,
        resolvedTheme: resolveTheme(mode),
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  },

  initializeTheme: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const mode: ThemeMode = (savedMode as ThemeMode) ?? 'system';
      set({
        mode,
        resolvedTheme: resolveTheme(mode),
        isLoading: false,
      });

      // Listen for system theme changes
      Appearance.addChangeListener(({ colorScheme }) => {
        const currentMode = get().mode;
        if (currentMode === 'system') {
          set({ resolvedTheme: colorScheme ?? 'light' });
        }
      });
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      set({ isLoading: false });
    }
  },

  toggleTheme: async () => {
    const { resolvedTheme, setThemeMode } = get();
    const newMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    await setThemeMode(newMode);
  },
}));
