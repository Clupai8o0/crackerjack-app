import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Glow, Text } from '@/components/ui';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';

export default function ArtistSubmitted() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <Stack.Screen options={{ gestureEnabled: false, headerBackVisible: false }} />
      <Glow size={280} style={{ top: -60, alignSelf: 'center', opacity: 0.45 }} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: T.sp6 }}>
          <View style={{ alignItems: 'center', gap: T.sp3 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Text variant="display-m">Application </Text>
              <Text variant="display-italic-m">submitted</Text>
            </View>
            <Text variant="body" color={T.ink2} style={{ textAlign: 'center', maxWidth: 280 }}>
              Our team will review your application within 48 hours. We'll notify you the moment
              you're verified.
            </Text>
          </View>
        </View>

        <View style={{ width: '100%' }}>
          <Button
            label="Got it"
            onPress={() => router.replace(DEMO_MODE ? '/(auth)/waitlist' : '/(app)')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
