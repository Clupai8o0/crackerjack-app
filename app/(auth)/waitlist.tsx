import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Glow, Text } from '@/components/ui';
import { useArtistApplication } from '@/features/artist/queries';
import { useSignOut } from '@/features/auth/mutations';
import { useAuthStore } from '@/features/auth/store';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';
import type { ArtistApplicationStatus } from '@/types/database';

type ApplicationData = {
  application_status: ArtistApplicationStatus;
  application_submitted_at: string | null;
  is_verified: boolean;
} | null;

export default function Waitlist() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();

  const { data: rawApplication, isLoading } = useArtistApplication(user?.id);
  const demoApplication: ApplicationData = DEMO_MODE
    ? {
        application_status: 'submitted',
        application_submitted_at: new Date().toISOString(),
        is_verified: false,
      }
    : null;
  const application = DEMO_MODE ? demoApplication : (rawApplication as ApplicationData);

  const isRejected = application?.application_status === 'rejected';

  function formatDate(iso: string | null | undefined) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (isLoading && !DEMO_MODE) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body" color={T.ink3}>
            Loading…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <Glow size={260} style={{ top: -50, alignSelf: 'center', opacity: 0.4 }} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: T.sp6 }}>
          <View style={{ gap: T.sp3 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {isRejected ? (
                <>
                  <Text variant="display-m">Application </Text>
                  <Text variant="display-italic-m">closed</Text>
                </>
              ) : (
                <>
                  <Text variant="display-m">Under </Text>
                  <Text variant="display-italic-m">review</Text>
                </>
              )}
            </View>

            {isRejected ? (
              <View style={{ gap: T.sp4 }}>
                <Text variant="body" color={T.ink2}>
                  Your application wasn't approved this round. You can re-apply with updated
                  details.
                </Text>
                <Text variant="body" color={T.ink2}>
                  For help, contact{' '}
                  <Text variant="body-strong" color={T.ink}>
                    support@crackerjack.app
                  </Text>
                </Text>
              </View>
            ) : (
              <View style={{ gap: T.sp4 }}>
                <Text variant="body" color={T.ink2}>
                  We'll let you know as soon as you're verified. This usually takes 24–48 hours.
                </Text>
                {application?.application_submitted_at && (
                  <Text
                    variant="caption"
                    style={{ fontFamily: T.mono, letterSpacing: 0.2 }}
                    color={T.ink3}
                  >
                    Submitted on {formatDate(application.application_submitted_at)}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => {
            if (DEMO_MODE) {
              router.replace('/(app)');
              return;
            }
            signOut.mutate(undefined, { onSuccess: () => router.replace('/(auth)/welcome') });
          }}
          hitSlop={12}
          style={{ alignItems: 'center', paddingVertical: T.sp4 }}
        >
          <Text variant="body" color={T.ink3}>
            {DEMO_MODE ? 'Continue (demo)' : 'Sign out'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
