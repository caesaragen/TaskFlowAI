import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
      clearError();
    }
  }, [error, clearError]);

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err) {
      // Error handled in useEffect
      console.log(`login error: ${err}`)
    }
  };

  return (
    <ScreenWrapper>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-done-circle" size={64} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>TaskFlow AI</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
            <Text style={styles.description}>Sign in to manage your tasks</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={theme.colors.placeholder} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                  returnKeyType="next"
                  textContentType="emailAddress"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={theme.colors.placeholder} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.colors.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.textInverse} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color={theme.colors.textInverse} />
                </>
              )}
            </TouchableOpacity>

            {/* Demo Info */}
            <View style={styles.demoInfo}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.demoInfoText}>
                Demo Mode: Create an account first, then login with those credentials
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons (Optional - for demo) */}
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={styles.socialButton}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                disabled={isLoading}
              >
                <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={isLoading}
              >
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: 600,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: {
    marginLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    paddingLeft: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing.md,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: 18,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
  },
  demoInfoText: {
    fontSize: 13,
    color: theme.colors.primary,
    marginLeft: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  footerText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  linkText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});