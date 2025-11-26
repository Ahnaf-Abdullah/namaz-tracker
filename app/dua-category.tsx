import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { ArrowLeft } from 'lucide-react-native';
import { Dua } from '@/types';
import duasData from '@/data/duas.json';

export default function DuaCategoryScreen() {
  const { theme } = useTheme();
  const { categoryId } = useLocalSearchParams();

  // Find the category
  const category = duasData.find((cat) => cat.id === categoryId);

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
    duaCard: {
      padding: 20,
      marginBottom: 16,
    },
    duaTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    arabicText: {
      fontSize: 24,
      color: theme.text,
      textAlign: 'right',
      lineHeight: 40,
      marginBottom: 12,
      fontWeight: '500',
    },
    transliterationLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    transliterationText: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    translationLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    translationText: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
  });

  const renderDua = ({ item }: { item: Dua }) => (
    <Card style={styles.duaCard}>
      <Text style={styles.duaTitle}>{item.title}</Text>

      <Text style={styles.arabicText}>{item.arabic}</Text>

      <Text style={styles.transliterationLabel}>Transliteration</Text>
      <Text style={styles.transliterationText}>{item.transliteration}</Text>

      <Text style={styles.translationLabel}>Translation</Text>
      <Text style={styles.translationText}>{item.english}</Text>
    </Card>
  );

  if (!category) {
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
          <Text style={styles.headerTitle}>Duas</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Category not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>{category.title}</Text>
      </View>

      <FlatList
        data={category.duas}
        renderItem={renderDua}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
