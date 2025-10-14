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
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { DuaCategory } from '@/types';

export default function DuasScreen() {
  const { theme } = useTheme();

  const duaCategories: DuaCategory[] = [
    {
      id: '1',
      title: 'Morning & Evening',
      description: 'Duas for starting and ending the day',
      duas: [],
    },
    {
      id: '2',
      title: 'Before Meals',
      description: 'Prayers before eating',
      duas: [],
    },
    {
      id: '3',
      title: 'Travel Duas',
      description: 'Prayers for safe journey',
      duas: [],
    },
    {
      id: '4',
      title: 'Seeking Forgiveness',
      description: 'Istighfar and repentance',
      duas: [],
    },
    {
      id: '5',
      title: 'Protection',
      description: 'Duas for protection from harm',
      duas: [],
    },
    {
      id: '6',
      title: 'Gratitude',
      description: 'Prayers of thankfulness',
      duas: [],
    },
  ];

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
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    categoryLeft: {
      flex: 1,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    categoryDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    chevron: {
      marginLeft: 16,
    },
  });

  const renderCategory = ({ item }: { item: DuaCategory }) => (
    <TouchableOpacity activeOpacity={0.7}>
      <Card style={styles.categoryItem}>
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
        </View>
        <ChevronRight 
          size={20} 
          color={theme.textSecondary} 
          style={styles.chevron} 
        />
      </Card>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Duas</Text>
      </View>

      <FlatList
        data={duaCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}