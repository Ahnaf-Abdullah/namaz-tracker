import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  disabled = false 
}: ButtonProps) {
  const { theme } = useTheme();

  const buttonStyles = StyleSheet.create({
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    primary: {
      backgroundColor: theme.secondary,
    },
    secondary: {
      backgroundColor: theme.accent,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.secondary,
    },
    disabled: {
      opacity: 0.6,
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryText: {
      color: '#FFFFFF',
    },
    secondaryText: {
      color: '#FFFFFF',
    },
    outlineText: {
      color: theme.secondary,
    },
  });

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [buttonStyles.button, buttonStyles.primary];
      case 'secondary':
        return [buttonStyles.button, buttonStyles.secondary];
      case 'outline':
        return [buttonStyles.button, buttonStyles.outline];
      default:
        return [buttonStyles.button, buttonStyles.primary];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return [buttonStyles.text, buttonStyles.primaryText];
      case 'secondary':
        return [buttonStyles.text, buttonStyles.secondaryText];
      case 'outline':
        return [buttonStyles.text, buttonStyles.outlineText];
      default:
        return [buttonStyles.text, buttonStyles.primaryText];
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        disabled && buttonStyles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}