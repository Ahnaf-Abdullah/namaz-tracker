import { Tabs } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Home, Users, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 70 + insets.bottom : 70,
          paddingBottom: Platform.OS === 'android' ? insets.bottom + 5 : 10,
          paddingTop: 10,
        },
        sceneContainerStyle: {
          paddingBottom: Platform.OS === 'android' ? 70 + insets.bottom : 70,
        },
        tabBarActiveTintColor: theme.secondary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          marginBottom: Platform.OS === 'android' ? 0 : 0,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
