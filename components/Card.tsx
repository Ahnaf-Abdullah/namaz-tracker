import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const { theme } = useTheme();

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });

  return <View style={[cardStyles.card, style]}>{children}</View>;
}