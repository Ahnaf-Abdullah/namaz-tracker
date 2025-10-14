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
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const success = await signUp(email, password);
    if (success) {
      Alert.alert(
        'Success',
        'Account created successfully! Please sign in with your new credentials.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
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
    signUpButton: {
      backgroundColor: theme.secondary,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    signUpButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    footer: {
      marginTop: 24,
      alignItems: 'center',
    },
    footerText: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    signInLink: {
      color: theme.secondary,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🕌</Text>
          </View>
          <Text style={styles.title}>Join Namaz Tracker</Text>
          <Text style={styles.subtitle}>
            Create your account to get started
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={theme.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
