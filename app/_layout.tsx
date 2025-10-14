import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';

function RootLayoutContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !showSplash) {
      if (!user) {
        router.replace('/login');
      }
    }
  }, [user, isLoading, showSplash, router]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="names" options={{ headerShown: false }} />
        <Stack.Screen name="duas" options={{ headerShown: false }} />
        <Stack.Screen name="qibla" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
