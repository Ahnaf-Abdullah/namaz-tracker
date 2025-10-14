import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { CheckBox } from '@/components/CheckBox';
import HadithCard from '@/components/HadithCard';
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const togglePrayer = (index: number) => {
    const updatedPrayers = [...prayers];
    updatedPrayers[index].completed = !updatedPrayers[index].completed;
    setPrayers(updatedPrayers);
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
