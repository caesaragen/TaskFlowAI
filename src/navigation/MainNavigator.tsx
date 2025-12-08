import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from './types';
import TaskNavigator from './TaskNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useTheme } from '../constants/theme';

const Tab = createBottomTabNavigator<MainStackParamList>();

export default function MainNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TaskNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Tasks',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
