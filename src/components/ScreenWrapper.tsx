import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Whether to use SafeAreaView edges. Defaults to ['top'] to preserve bottom navigation visibility */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Override the background color */
  backgroundColor?: string;
  /** Whether to apply padding instead of safe area insets */
  usePadding?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  edges = ['top'],
  backgroundColor,
  usePadding = false,
}) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDarkMode = colorScheme === 'dark';

  const colors = {
    background: isDarkMode ? '#121212' : '#FFFFFF',
    statusBar: isDarkMode ? 'light' : 'dark' as 'light' | 'dark',
  };

  const bgColor = backgroundColor ?? colors.background;

  if (usePadding) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            paddingTop: edges.includes('top') ? insets.top : 0,
            paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
            paddingLeft: edges.includes('left') ? insets.left : 0,
            paddingRight: edges.includes('right') ? insets.right : 0,
          },
          style,
        ]}
      >
        <StatusBar
          style={colors.statusBar}
          backgroundColor={bgColor}
        />
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }, style]}
      edges={edges}
    >
      <StatusBar
        style={colors.statusBar}
        backgroundColor={bgColor}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default React.memo(ScreenWrapper);
