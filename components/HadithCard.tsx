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
  const [dataSource, setDataSource] = useState<'api' | 'cache' | 'local'>(
    'local'
  );

  const loadDailyHadith = async () => {
    try {
      setLoading(true);
      const result = await hadithService.getDailyHadith();
      setHadith(result.hadith);
      setDataSource(result.source);
      console.log(`📱 Hadith loaded from: ${result.source}`);
    } catch (error) {
      console.error('Error loading hadith:', error);
      // Set a fallback hadith if there's an error
      setHadith({
        id: 1,
        text: 'Actions are but by intention and every man shall have only that which he intended.',
        reference: 'Narrated by Umar ibn al-Khattab (RA)',
        collection: 'Bukhari & Muslim',
      });
      setDataSource('local');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Manual refresh requested');

      // Force fetch new hadith from API
      const result = await hadithService.getDailyHadith(true);
      setHadith(result.hadith);
      setDataSource(result.source);
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
    sourceIndicator: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
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
          <Text
            style={[
              styles.sourceIndicator,
              {
                color:
                  dataSource === 'api'
                    ? '#4CAF50'
                    : dataSource === 'cache'
                    ? '#FF9800'
                    : '#757575',
                fontSize: 10,
                marginLeft: 8,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor:
                  dataSource === 'api'
                    ? '#4CAF5020'
                    : dataSource === 'cache'
                    ? '#FF980020'
                    : '#75757520',
              },
            ]}
          >
            {dataSource === 'api'
              ? '🌐 LIVE'
              : dataSource === 'cache'
              ? ' CACHED'
              : ' LOCAL'}
          </Text>
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
        {/* {hadith.reference && (
          <Text style={styles.source}>{hadith.reference}</Text>
        )} */}
      </View>
    </View>
  );
}
