import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Book, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { hadithService, Hadith } from '@/services/hadithService';

interface HadithCardProps {
  onRefresh?: () => void;
}

export default function HadithCard({ onRefresh }: HadithCardProps) {
  const { theme } = useTheme();
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDailyHadith();
  }, []);

  const loadDailyHadith = async () => {
    try {
      setLoading(true);
      const dailyHadith = await hadithService.getDailyHadith();
      setHadith(dailyHadith);
    } catch (error) {
      console.error('Error loading hadith:', error);
      // Set a fallback hadith if there's an error
      setHadith({
        id: 1,
        text: 'Actions are but by intention and every man shall have only that which he intended.',
        reference: 'Narrated by Umar ibn al-Khattab (RA)',
        collection: 'Bukhari & Muslim',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Force fetch new hadith by clearing cache
      await hadithService.clearCache();

      const newHadith = await hadithService.getDailyHadith();
      setHadith(newHadith);
      onRefresh?.();
    } catch (error) {
      console.error('Error refreshing hadith:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 8,
    },
    refreshButton: {
      padding: 4,
      borderRadius: 6,
      backgroundColor: theme.border + '40',
    },
    hadithText: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'left',
      marginBottom: 12,
      color: theme.text,
      fontStyle: 'italic',
    },
    attribution: {
      alignItems: 'flex-end',
    },
    reference: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    source: {
      fontSize: 12,
      marginTop: 2,
      color: theme.textSecondary,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      textAlign: 'center',
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 8,
    },
    errorText: {
      textAlign: 'center',
      fontSize: 14,
      color: theme.textSecondary,
      padding: 20,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.secondary} />
          <Text style={styles.loadingText}>Loading daily hadith...</Text>
        </View>
      </View>
    );
  }

  if (!hadith) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Unable to load hadith at this time.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Book size={20} color={theme.secondary} />
          <Text style={styles.title}>Daily Hadith</Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          style={[styles.refreshButton, { opacity: refreshing ? 0.5 : 1 }]}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <RefreshCw size={18} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.hadithText}>"{hadith.text}"</Text>

      <View style={styles.attribution}>
        <Text style={styles.reference}>— {hadith.collection}</Text>
        {hadith.reference && (
          <Text style={styles.source}>{hadith.reference}</Text>
        )}
      </View>
    </View>
  );
}
