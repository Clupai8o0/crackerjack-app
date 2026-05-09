import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Glow, Text } from '@/components/ui';
import { useCompleteSetup } from '@/features/artist/mutations';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';

export default function AttendeeSetup() {
  const router = useRouter();
  const completeSetup = useCompleteSetup();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <Glow size={260} style={{ top: -40, alignSelf: 'center', opacity: 0.5 }} />
      <View
        style={{
          flex: 1,
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ paddingTop: T.sp9, gap: T.sp3 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text variant="display-m">Welcome </Text>
            <Text variant="display-italic-m">in</Text>
          </View>
          <Text variant="body" color={T.ink2}>
            Browse artists, follow events. You can upgrade to organizer anytime from settings.
          </Text>
        </View>

        <Button
          label="Start browsing"
          onPress={() => {
            if (DEMO_MODE) {
              router.replace('/(app)');
              return;
            }
            completeSetup.mutate();
          }}
          loading={completeSetup.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
