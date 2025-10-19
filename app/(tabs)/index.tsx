import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { CheckBox } from '@/components/CheckBox';
import HadithCard from '@/components/HadithCard';
import {
  pointsService,
  PrayerPoints,
  UserStats,
} from '@/services/pointsService';
import {
  Clock,
  Calendar,
  Check,
  Sun,
  Sunset,
  Moon,
  Book,
  Heart,
  Compass,
} from 'lucide-react-native';

interface Prayer {
  name: string;
  time: string;
  completed: boolean;
  icon: any;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [prayers, setPrayers] = useState<Prayer[]>([
    { name: 'Fajr', time: '05:30', completed: false, icon: Sun },
    { name: 'Dhuhr', time: '12:45', completed: false, icon: Sun },
    { name: 'Asr', time: '16:15', completed: false, icon: Sunset },
    { name: 'Maghrib', time: '18:45', completed: false, icon: Sunset },
    { name: 'Isha', time: '20:30', completed: false, icon: Moon },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [lastPrayerPoints, setLastPrayerPoints] = useState<PrayerPoints | null>(
    null
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadDailyScore();
      loadCompletedPrayers();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    const result = await pointsService.getUserStats(user.id);
    if (result.success && result.data) {
      setUserStats(result.data);
    }
  };

  const loadDailyScore = async () => {
    if (!user) return;

    const result = await pointsService.getDailyScore(user.id);
    if (result.success && result.data) {
      setDailyPoints(result.data.totalPoints);
    }
  };

  const loadCompletedPrayers = async () => {
    if (!user) return;

    const result = await pointsService.getDailyScore(user.id);
    if (result.success && result.data && result.data.prayersCompleted) {
      // Update prayer completion status based on database
      const updatedPrayers = prayers.map((prayer) => ({
        ...prayer,
        completed: result.data!.prayersCompleted.includes(prayer.name),
      }));
      setPrayers(updatedPrayers);
    }
  };

  const togglePrayer = async (index: number) => {
    if (!user) return;

    const prayer = prayers[index];

    // Prevent unchecking completed prayers
    if (prayer.completed) {
      Alert.alert(
        'Prayer Already Completed',
        'You cannot uncheck a completed prayer. Each prayer can only be marked once per day.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Mark prayer as completed
    const updatedPrayers = [...prayers];
    updatedPrayers[index].completed = true;
    setPrayers(updatedPrayers);

    // Award points for completing the prayer
    const result = await pointsService.completePrayer(user.id, prayer.name);

    if (result.success && result.points) {
      setLastPrayerPoints(result.points);
      setDailyPoints(result.dailyTotal || 0);

      // Show points notification
      Alert.alert(
        '🎉 Prayer Completed!',
        `You earned ${result.points.total} points!\n` +
          `Base: ${result.points.base} pts\n` +
          `Speed Bonus: ${result.points.speedBonus} pts\n\n` +
          `Daily Total: ${result.dailyTotal} points`,
        [{ text: 'Alhamdulillah!', style: 'default' }]
      );

      // Refresh stats
      loadUserStats();
    } else {
      // If point awarding failed, revert the checkbox
      const revertedPrayers = [...prayers];
      revertedPrayers[index].completed = false;
      setPrayers(revertedPrayers);

      Alert.alert(
        'Error',
        'Failed to save prayer completion. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const completedCount = prayers.filter((prayer) => prayer.completed).length;
  const completionPercentage = Math.round(
    (completedCount / prayers.length) * 100
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? insets.top : 0,
    },
    content: {
      padding: 20,
      paddingBottom: Platform.OS === 'android' ? 20 + insets.bottom + 70 : 90,
    },
    header: {
      marginBottom: 25,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    dateTime: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 5,
    },
    greeting: {
      fontSize: 18,
      color: theme.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    progressCard: {
      marginBottom: 20,
      alignItems: 'center',
    },
    progressText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 10,
    },
    progressNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.secondary,
      marginBottom: 5,
    },
    progressSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    prayersTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 15,
    },
    prayerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    prayerItemCompleted: {
      backgroundColor: theme.secondary + '20',
      borderColor: theme.secondary,
    },
    prayerIcon: {
      marginRight: 15,
    },
    prayerDetails: {
      flex: 1,
    },
    prayerName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    prayerTime: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    prayerCheckbox: {
      marginLeft: 15,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    navButton: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: 100,
      justifyContent: 'center',
    },
    navButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 16,
    },
    pointsCard: {
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    pointsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    pointsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    pointsValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.secondary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statLabel: {
      fontSize: 12,
      marginBottom: 4,
      color: theme.textSecondary,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    lastPointsCard: {
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      backgroundColor: theme.secondary + '20',
    },
    lastPointsText: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      color: theme.secondary,
    },
    bonusText: {
      fontWeight: 'bold',
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Namaz Tracker</Text>
          <Text style={styles.dateTime}>{formatDate(currentTime)}</Text>
          <Text style={styles.dateTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.greeting}>
            Assalamu Alaikum, {user?.name || 'User'}!
          </Text>
        </View>

        {/* Points Dashboard */}
        <Card style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Text style={styles.pointsTitle}>Today's Points</Text>
            <Text style={styles.pointsValue}>{dailyPoints}</Text>
          </View>

          {userStats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Highest Score</Text>
                <Text style={styles.statValue}>
                  {userStats.highestDailyScore}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>
                  {userStats.currentStreak} days
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Score</Text>
                <Text style={styles.statValue}>
                  {Math.round(userStats.averageDailyScore)}
                </Text>
              </View>
            </View>
          )}

          {lastPrayerPoints && (
            <View style={styles.lastPointsCard}>
              <Text style={styles.lastPointsText}>
                Last Prayer: +{lastPrayerPoints.total} points
                {lastPrayerPoints.speedBonus > 0 && (
                  <Text style={styles.bonusText}>
                    {' '}
                    (Speed Bonus: +{lastPrayerPoints.speedBonus})
                  </Text>
                )}
              </Text>
            </View>
          )}
        </Card>

        <HadithCard />

        <Card style={styles.progressCard}>
          <Text style={styles.progressText}>Today's Progress</Text>
          <Text style={styles.progressNumber}>{completionPercentage}%</Text>
          <Text style={styles.progressSubtext}>
            {completedCount} of {prayers.length} prayers completed
          </Text>
        </Card>

        <Text style={styles.prayersTitle}>Prayer Times</Text>

        {prayers.map((prayer, index) => {
          const IconComponent = prayer.icon;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.prayerItem,
                prayer.completed && styles.prayerItemCompleted,
              ]}
              onPress={() => togglePrayer(index)}
            >
              <View style={styles.prayerIcon}>
                <IconComponent
                  size={24}
                  color={
                    prayer.completed ? theme.secondary : theme.textSecondary
                  }
                />
              </View>

              <View style={styles.prayerDetails}>
                <Text style={styles.prayerName}>{prayer.name}</Text>
                <Text style={styles.prayerTime}>{prayer.time}</Text>
              </View>

              <View style={styles.prayerCheckbox}>
                <CheckBox
                  checked={prayer.completed}
                  onPress={() => togglePrayer(index)}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <Text
          style={[styles.prayersTitle, { marginTop: 30, marginBottom: 15 }]}
        >
          Islamic Resources
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/names')}
          >
            <Book size={28} color={theme.secondary} />
            <Text style={styles.navButtonText}>99 Names of Allah</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/duas')}
          >
            <Heart size={28} color={theme.secondary} />
            <Text style={styles.navButtonText}>Duas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/qibla')}
          >
            <Compass size={28} color={theme.secondary} />
            <Text style={styles.navButtonText}>Qibla Compass</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
