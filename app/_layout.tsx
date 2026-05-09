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

import { useProfile } from '@/features/auth/queries';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/store';
import { useSession } from '@/hooks/useSession';
import { initAnalytics, track } from '@/lib/analytics';
import { initSentry } from '@/lib/errors';
import type { UserRole } from '@/types/database';

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
  const { setRole, setSetupComplete } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  const userId = session?.user?.id;
  const { data: profile, isFetched: profileFetched, isError: profileError } = useProfile(userId);

  const ready = initialized && (!session || profileFetched);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Sync profile → store so downstream components can read role etc.
  useEffect(() => {
    if (profile) {
      setRole(profile.role as UserRole | null);
      setSetupComplete(profile.setup_complete);
    }
  }, [profile, setRole, setSetupComplete]);

  useEffect(() => {
    if (!initialized) return;
    if (session && !profileFetched) return;

    // Session exists but profile is gone (DB reset, deleted account) — sign out
    if (session && profileFetched && profileError) {
      supabase.auth.signOut();
      return;
    }

    const seg0 = segments[0] as string;
    const inOnboarding = seg0 === '(onboarding)';
    const inAuthGroup = seg0 === '(auth)';
    const inAppGroup = seg0 === '(app)';
    const inSetup = inAuthGroup && (segments[1] as string) === 'setup';

    // Not signed in → onboarding first, then auth screens
    if (!session) {
      if (!inOnboarding && !inAuthGroup) router.replace('/(onboarding)');
      return;
    }

    if (!profile?.role) {
      const inRole = inAuthGroup && segments[1] === 'role';
      if (!inRole) router.replace('/(auth)/role');
      return;
    }

    if (!profile?.setup_complete) {
      if (!inSetup) {
        const setupRoute =
          profile.role === 'organizer' ? '/(auth)/setup/organizer' : '/(auth)/setup/artist';
        router.replace(setupRoute as Parameters<typeof router.replace>[0]);
      }
      return;
    }

    if (!inAppGroup) router.replace('/(app)');
  }, [session, profile, profileFetched, initialized, router, segments]);

  if (!ready) return null;

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
    if (fontsLoaded) track.appOpened();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
