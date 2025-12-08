import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../constants/theme';

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
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const bgColor = backgroundColor ?? theme.colors.background;

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
        <StatusBar style={theme.colors.statusBar} />
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }, style]}
      edges={edges}
    >
      <StatusBar style={theme.colors.statusBar} />
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
