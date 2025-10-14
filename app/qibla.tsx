import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { ArrowLeft, Compass, MapPin } from 'lucide-react-native';

export default function QiblaScreen() {
  const { theme } = useTheme();

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
      marginBottom: 40,
    },
    compassIcon: {
      marginBottom: 20,
    },
    placeholderText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    descriptionText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    infoCard: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 24,
    },
    locationText: {
      fontSize: 16,
      color: theme.text,
      marginTop: 16,
      textAlign: 'center',
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
        <Card style={styles.infoCard}>
          <View style={styles.compassContainer}>
            <View style={styles.compassIcon}>
              <Compass size={80} color={theme.secondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.placeholderText}>Qibla Compass</Text>
            <Text style={styles.descriptionText}>
              This feature will help you find the direction of Kaaba in Mecca for your prayers.
              {'\n\n'}
              Compass functionality will be implemented here.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <MapPin size={16} color={theme.textSecondary} />
            <Text style={styles.locationText}>Location permission required</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}