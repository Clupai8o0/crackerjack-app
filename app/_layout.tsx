import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import { Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';

import { useAuthStore } from '@/features/auth/store';
import { useSession } from '@/hooks/useSession';
import { initAnalytics, track } from '@/lib/analytics';
import { initSentry } from '@/lib/errors';

SplashScreen.preventAutoHideAsync();

initSentry();
initAnalytics();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

function AuthGate() {
  const { session, initialized } = useSession();
  const role = useAuthStore((s) => s.role);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/sign-in');
    } else if (!role) {
      router.replace('/(auth)/role');
    } else {
      if (!inAppGroup) router.replace('/(app)');
    }
  }, [session, role, initialized, router, segments]);

  return <Slot />;
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      track.appOpened();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
