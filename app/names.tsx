import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { ArrowLeft } from 'lucide-react-native';
import { Name99 } from '@/types';
import names99Data from '@/data/names99.json';

export default function Names99Screen() {
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
      padding: 20,
    },
    nameItem: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    nameNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.secondary,
      marginBottom: 8,
    },
    nameArabic: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'right',
      marginBottom: 8,
    },
    nameTransliteration: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    nameEnglish: {
      fontSize: 14,
      color: theme.textSecondary,
      fontStyle: 'italic',
    },
  });

  const renderName = ({ item, index }: { item: Name99; index: number }) => (
    <Card style={styles.nameItem}>
      <Text style={styles.nameNumber}>{index + 1}</Text>
      <Text style={styles.nameArabic}>{item.arabic}</Text>
      <Text style={styles.nameTransliteration}>{item.transliteration}</Text>
      <Text style={styles.nameEnglish}>{item.english}</Text>
    </Card>
  );

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
        <Text style={styles.headerTitle}>99 Names of Allah</Text>
      </View>

      <FlatList
        data={names99Data}
        renderItem={renderName}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}