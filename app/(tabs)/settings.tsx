import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Target, User, Calendar, MapPin, Sun, Mail } from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mock data for demonstration - in real app this would come from Firebase/context
  const [userStats] = useState({
    totalPoints: 920,
    prayersCompleted: 156,
    dayStreak: 15,
    joinedDate: 'December 2023',
    location: 'Mecca, Saudi Arabia',
  });

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? insets.top : 0,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    profileCard: {
      marginBottom: 20,
      padding: 25,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#2ECC71',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    messageIcon: {
      padding: 8,
      backgroundColor: theme.border,
      borderRadius: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statIcon: {
      marginBottom: 8,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 8,
    },
    preferencesSection: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 15,
    },
    preferenceCard: {
      marginBottom: 15,
    },
    preferenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
    },
    preferenceLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    preferenceIcon: {
      marginRight: 15,
    },
    preferenceInfo: {
      flex: 1,
    },
    preferenceTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 2,
    },
    preferenceSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    logoutContainer: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'android' ? 30 + insets.bottom + 70 : 100,
    },
    logoutButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#E74C3C',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
    },
    logoutText: {
      color: '#E74C3C',
      fontWeight: '600',
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>

          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getUserInitials(user?.name)}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.name || 'Abdullah Rahman'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email || 'abdullah@example.com'}
                </Text>
              </View>

              <TouchableOpacity style={styles.messageIcon}>
                <Mail size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Target size={20} color="#1ABC9C" style={styles.statIcon} />
                <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
                <Text style={styles.statLabel}>Total{'\n'}Points</Text>
              </View>

              <View style={styles.statItem}>
                <User size={20} color="#2ECC71" style={styles.statIcon} />
                <Text style={styles.statNumber}>
                  {userStats.prayersCompleted}
                </Text>
                <Text style={styles.statLabel}>Prayers{'\n'}Completed</Text>
              </View>

              <View style={styles.statItem}>
                <Calendar size={20} color="#F39C12" style={styles.statIcon} />
                <Text style={styles.statNumber}>{userStats.dayStreak}</Text>
                <Text style={styles.statLabel}>Day{'\n'}Streak</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={16} color={theme.textSecondary} />
              <Text style={styles.infoText}>joined {userStats.joinedDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={16} color={theme.textSecondary} />
              <Text style={styles.infoText}>{userStats.location}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <Card style={styles.preferenceCard}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <Sun
                  size={24}
                  color={theme.secondary}
                  style={styles.preferenceIcon}
                />
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Dark Mode</Text>
                  <Text style={styles.preferenceSubtitle}>
                    {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.secondary }}
                thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </Card>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
