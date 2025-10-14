import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

const lightTheme: ThemeColors = {
  primary: '#FFFFFF',
  secondary: '#16A085',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E1E8ED',
  accent: '#16A085',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
};

const darkTheme: ThemeColors = {
  primary: '#000000',
  secondary: '#FF8500',
  background: '#000000',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#333333',
  accent: '#FF8500',
  success: '#2ECC71',
  warning: '#F1C40F',
  error: '#E74C3C',
};

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setIsDark(colorScheme === 'dark');

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });

    return () => subscription?.remove();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
