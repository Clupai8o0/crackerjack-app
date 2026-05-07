import { View } from 'react-native';
import { Glow, Screen, Text } from '@/components/ui';
import { useProfile } from '@/features/auth/queries';
import { useAuthStore } from '@/features/auth/store';
import { T } from '@/lib/theme';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useProfile(user?.id);

  return (
    <Screen>
      <Glow style={{ top: 40, right: -80, opacity: 0.45 }} />

      <View style={{ paddingTop: T.sp6, gap: T.sp9 }}>
        <View style={{ gap: T.sp2 }}>
          {isLoading ? (
            <Text variant="display-m" color={T.ink3}>
              Loading…
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text variant="display-m">Hey, </Text>
              <Text variant="display-italic-m">
                {profile?.display_name ?? user?.email?.split('@')[0] ?? 'there'}
              </Text>
            </View>
          )}
          <Text variant="body">
            {profile?.role === 'artist'
              ? 'Your dashboard is coming in Phase 2.'
              : profile?.role === 'organizer'
                ? 'Discover artists is coming in Phase 3.'
                : 'More coming soon.'}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
