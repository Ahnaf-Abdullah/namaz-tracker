import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react-native';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import {
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  getCardinalDirection,
  formatDistance,
} from '@/services/qiblaService';

export default function QiblaScreen() {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const compassRotation = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermissionsAndSetup();

    return () => {
      Magnetometer.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // Animate compass rotation - this rotates the Qibla arrow
    Animated.spring(compassRotation, {
      toValue: -deviceHeading,
      useNativeDriver: true,
      friction: 10,
    }).start();
  }, [deviceHeading]);

  async function requestPermissionsAndSetup() {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required for Qibla direction');
        setLoading(false);
        return;
      }

      // Get user location
      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = userLocation.coords;

      // Calculate Qibla direction
      const qibla = calculateQiblaDirection(latitude, longitude);
      setQiblaDirection(qibla);

      // Calculate distance to Kaaba
      const distanceKm = calculateDistanceToKaaba(latitude, longitude);
      setDistance(formatDistance(distanceKm));

      // Get location name
      const [locationData] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (locationData) {
        const locationParts = [
          locationData.city,
          locationData.region,
          locationData.country,
        ].filter(Boolean);
        setLocation(locationParts.join(', '));
      }

      // Start magnetometer
      Magnetometer.setUpdateInterval(100);
      Magnetometer.addListener((data) => {
        // Calculate heading from magnetometer data
        let angle = Math.atan2(data.y, data.x);
        angle = angle * (180 / Math.PI);

        // Normalize to 0-360
        let heading = angle >= 0 ? angle : 360 + angle;

        setDeviceHeading(heading);
      });

      setHasPermission(true);
      setLoading(false);
    } catch (err) {
      console.error('Error setting up Qibla compass:', err);
      setError('Failed to set up compass. Please try again.');
      setLoading(false);
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compassContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 280,
      height: 280,
      position: 'relative',
    },
    compassCircle: {
      width: 280,
      height: 280,
      borderRadius: 140,
      borderWidth: 3,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    qiblaArrow: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowPointer: {
      width: 0,
      height: 0,
      borderLeftWidth: 15,
      borderRightWidth: 15,
      borderBottomWidth: 100,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#10b981',
    },
    centerDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.primary,
      zIndex: 10,
    },
    infoCard: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 20,
      marginTop: 30,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
    },
    infoText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 8,
    },
    headingText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 16,
    },
    directionText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 4,
    },
    errorText: {
      fontSize: 16,
      color: '#ef4444',
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Qibla Compass</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <Card style={styles.infoCard}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.infoText, { marginTop: 16 }]}>
              Setting up compass...
            </Text>
          </Card>
        ) : error ? (
          <Card style={styles.infoCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={requestPermissionsAndSetup}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            <View style={styles.compassContainer}>
              <View style={styles.compassCircle} />

              {/* Qibla Direction Arrow - Points to Kaaba */}
              <Animated.View
                style={[
                  styles.qiblaArrow,
                  {
                    transform: [
                      {
                        rotate: Animated.add(
                          Animated.add(compassRotation, qiblaDirection),
                          89
                        ).interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.arrowPointer} />
              </Animated.View>

              {/* Center dot */}
              <View style={styles.centerDot} />
            </View>

            <Card style={styles.infoCard}>
              <Text style={styles.headingText}>
                {Math.round(qiblaDirection)}°
              </Text>
              <Text style={styles.directionText}>
                {getCardinalDirection(qiblaDirection)} - Qibla Direction
              </Text>

              {location && (
                <View style={[styles.infoRow, { marginTop: 20 }]}>
                  <MapPin size={18} color={theme.textSecondary} />
                  <Text style={styles.infoText}>{location}</Text>
                </View>
              )}

              {distance && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoText, { marginLeft: 0 }]}>
                    Distance to Kaaba: {distance}
                  </Text>
                </View>
              )}
            </Card>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
