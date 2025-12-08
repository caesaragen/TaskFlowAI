import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';
import { useThemeStore, ThemeMode } from '../store/useThemeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'selector';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon' }) => {
  const theme = useTheme();
  const { mode, resolvedTheme, setThemeMode, toggleTheme } = useThemeStore();
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    toggleTheme();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={handleToggle}
        style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
        accessibilityLabel={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        accessibilityRole="button"
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons
            name={resolvedTheme === 'dark' ? 'sunny' : 'moon'}
            size={24}
            color={theme.colors.text}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  const options: { mode: ThemeMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { mode: 'light', icon: 'sunny', label: 'Light' },
    { mode: 'dark', icon: 'moon', label: 'Dark' },
    { mode: 'system', icon: 'phone-portrait-outline', label: 'System' },
  ];

  return (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>
        Appearance
      </Text>
      <View
        style={[
          styles.selectorOptions,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.selectorOption,
              mode === option.mode && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setThemeMode(option.mode)}
            accessibilityLabel={`${option.label} theme`}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === option.mode }}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={mode === option.mode ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.optionLabel,
                { color: mode === option.mode ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectorOptions: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  selectorOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeToggle;
