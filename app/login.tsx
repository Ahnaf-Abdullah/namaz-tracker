import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const success = await signIn(email, password);
    if (success) {
      router.replace('/(tabs)' as any); // Navigate to tabs now that they're properly set up
    } else {
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    // Placeholder for Google Sign-In
    Alert.alert('Coming Soon', 'Google Sign-In will be implemented soon');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    logoText: {
      fontSize: 32,
      color: '#FFFFFF',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 40,
      textAlign: 'center',
    },
    form: {
      width: '100%',
      maxWidth: 350,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: 50,
      color: theme.text,
      fontSize: 16,
    },
    eyeIcon: {
      padding: 4,
    },
    signInButton: {
      backgroundColor: theme.secondary,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    signInButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    forgotPassword: {
      alignSelf: 'center',
      marginTop: 16,
    },
    forgotPasswordText: {
      color: theme.secondary,
      fontSize: 16,
      fontWeight: '500',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      marginHorizontal: 16,
      color: theme.textSecondary,
      fontSize: 14,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      borderRadius: 12,
      height: 50,
      borderWidth: 1,
      borderColor: theme.border,
    },
    googleIcon: {
      marginRight: 12,
      fontSize: 18,
    },
    googleButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '500',
    },
    footer: {
      marginTop: 24,
      alignItems: 'center',
    },
    footerText: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    signUpLink: {
      color: theme.secondary,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🕌</Text>
          </View>
          <Text style={styles.title}>Namaz Tracker</Text>
          <Text style={styles.subtitle}>
            Track your prayers and connect with friends
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.googleIcon}>🔍</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <TouchableOpacity onPress={() => router.push('/signup' as any)}>
              <Text style={styles.signUpLink}>Create Account</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
