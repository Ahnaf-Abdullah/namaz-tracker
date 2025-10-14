import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Hide splash screen after 3 seconds with fade out only
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, onFinish]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    content: {
      alignItems: 'center',
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    logoText: {
      fontSize: 48,
      color: '#FFFFFF',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 18,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.secondary,
      marginHorizontal: 4,
    },
  });

  const LoadingDots = () => {
    const [dotAnim1] = useState(new Animated.Value(0));
    const [dotAnim2] = useState(new Animated.Value(0));
    const [dotAnim3] = useState(new Animated.Value(0));

    useEffect(() => {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dotAnim1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim1, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => animateDots());
      };

      const timer = setTimeout(() => {
        animateDots();
      }, 1500);

      return () => clearTimeout(timer);
    }, [dotAnim1, dotAnim2, dotAnim3]);

    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingDot, { opacity: dotAnim1 }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dotAnim2 }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dotAnim3 }]} />
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[styles.content, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>🕌</Text>
        </View>
        <Text style={styles.title}>Namaz Tracker</Text>
        <Text style={styles.subtitle}>
          Track your prayers and connect with friends
        </Text>
        <LoadingDots />
      </Animated.View>
    </Animated.View>
  );
}
