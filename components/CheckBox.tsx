import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CheckBoxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

export function CheckBox({ checked, onPress, size = 24 }: CheckBoxProps) {
  const { theme } = useTheme();

  const checkboxStyles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 4,
      borderWidth: 2,
      borderColor: checked ? theme.secondary : theme.border,
      backgroundColor: checked ? theme.secondary : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={checkboxStyles.container}>
        {checked && <Check size={size * 0.6} color="#FFFFFF" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
}