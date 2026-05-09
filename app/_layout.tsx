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
import { useEffect, useRef } from 'react';
import '../global.css';

import { useArtistApplication } from '@/features/artist/queries';
import { useProfile } from '@/features/auth/queries';
import { useAuthStore } from '@/features/auth/store';
import { useSession } from '@/hooks/useSession';
import { initAnalytics, track } from '@/lib/analytics';
import { DEMO_MODE } from '@/lib/demo';
import { initSentry } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { Database, UserRole } from '@/types/database';

SplashScreen.preventAutoHideAsync();

initSentry();
initAnalytics();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

type Profile = Database['public']['Tables']['profiles']['Row'];
type ArtistApp = Database['public']['Tables']['artist_profiles']['Row'] | null;

function nextRouteFor(profile: Profile, artistApp: ArtistApp): string {
  // 2. Phone not verified
  if (!profile.phone_verified_at) return '/(auth)/verify-phone';

  // 3. Basic profile incomplete
  if (!profile.display_name || !profile.city) return '/(auth)/setup/profile';

  // 4. No role chosen
  if (!profile.role) return '/(auth)/role';

  // 5. Role chosen — branch by role
  if (profile.role === 'organizer') {
    return profile.setup_complete ? '/(app)' : '/(auth)/setup/organizer';
  }

  if (profile.role === 'attendee') {
    return profile.setup_complete ? '/(app)' : '/(auth)/setup/attendee';
  }

  if (profile.role === 'artist') {
    // No application row yet, or still a draft
    if (!artistApp || artistApp.application_status === 'draft') {
      return '/(auth)/setup/artist/details';
    }
    // Submitted but not yet verified (covers re-entry after setup_complete)
    if (artistApp.application_status === 'submitted' && !artistApp.is_verified) {
      return '/(auth)/waitlist';
    }
    // Rejected
    if (artistApp.application_status === 'rejected') {
      return '/(auth)/waitlist';
    }
    // Approved or verified — full access
    if (artistApp.application_status === 'approved' || artistApp.is_verified) {
      return '/(app)';
    }
    // Fallback: treat unknown state as needing details
    return '/(auth)/setup/artist/details';
  }

  // role === 'both' | 'admin' — just send to app
  return '/(app)';
}

function AuthGate() {
  const { session, initialized } = useSession();
  const { setRole, setSetupComplete } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  const userId = session?.user?.id;

  const { data: profile, isFetched: profileFetched, isError: profileError } = useProfile(userId);

  const isArtist = profile?.role === 'artist';

  const { data: artistApp, isFetched: artistAppFetched } = useArtistApplication(
    isArtist ? userId : undefined,
  );

  // All data needed to make a routing decision is available
  const ready = initialized && (!session || (profileFetched && (!isArtist || artistAppFetched)));

  useEffect(() => {
    if (ready || DEMO_MODE) SplashScreen.hideAsync();
  }, [ready]);

  // DEMO_MODE: send the user to onboarding on initial mount so the slideshow
  // starts at the first screen instead of falling through to /(app).
  const demoStartedRef = useRef(false);
  useEffect(() => {
    if (!DEMO_MODE || demoStartedRef.current) return;
    demoStartedRef.current = true;
    router.replace('/(onboarding)');
  }, [router]);

  // Sync profile → store so downstream components can read role etc.
  useEffect(() => {
    if (profile) {
      setRole(profile.role as UserRole | null);
      setSetupComplete(profile.setup_complete);
    }
  }, [profile, setRole, setSetupComplete]);

  useEffect(() => {
    // DEMO_MODE: each screen self-navigates via router.push. Don't fight it.
    if (DEMO_MODE) return;
    if (!ready) return;

    // Session exists but profile is gone (deleted account) — sign out
    if (session && profileFetched && profileError) {
      supabase.auth.signOut();
      return;
    }

    const seg0 = segments[0] as string;
    const inOnboarding = seg0 === '(onboarding)';
    const inAuthGroup = seg0 === '(auth)';
    const inAppGroup = seg0 === '(app)';

    // 1. No session → onboarding / auth screens
    if (!session) {
      if (!inOnboarding && !inAuthGroup) router.replace('/(onboarding)');
      return;
    }

    if (!profile) return;

    const target = nextRouteFor(profile, isArtist ? (artistApp ?? null) : null);

    // Avoid redirect loops: if already on the correct top-level group, return.
    // For /(app), any screen inside is fine.
    if (target === '/(app)' && inAppGroup) return;

    // For auth sub-routes, compare the full segment path to avoid re-routing
    // within the same wizard step.
    if (target !== '/(app)') {
      // target is always /(auth)/... — check if we're already on the right sub-path
      // e.g. '/(auth)/setup/artist/details' → ['setup', 'artist', 'details']
      // segments: ['(auth)', 'setup', 'artist', 'details']
      const segTail = segments.slice(1) as string[];
      const targetTail = target.replace(/^\/\(auth\)\//, '').split('/');
      const alreadyThere = inAuthGroup && targetTail.every((part, i) => segTail[i] === part);
      if (alreadyThere) return;
    }

    router.replace(target as Parameters<typeof router.replace>[0]);
  }, [
    ready,
    session,
    profile,
    profileError,
    profileFetched,
    isArtist,
    artistApp,
    router,
    segments,
  ]);

  if (!ready && !DEMO_MODE) return null;

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
