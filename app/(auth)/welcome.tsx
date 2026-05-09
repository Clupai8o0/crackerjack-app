import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text as RNText, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Glow, Text } from '@/components/ui';
import { useSignInWithApple, useSignInWithGoogle } from '@/features/auth/mutations';
import { T } from '@/lib/theme';

export default function Welcome() {
  const router = useRouter();
  const googleSignIn = useSignInWithGoogle();
  const appleSignIn = useSignInWithApple();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <Glow size={300} style={{ top: -60, alignSelf: 'center', opacity: 0.6 }} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9,
          justifyContent: 'space-between',
        }}
      >
        {/* Logo + headline */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: T.sp8 }}>
          <CJMark />
          <View style={{ alignItems: 'center', gap: T.sp3 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text variant="display-m">Let's </Text>
              <Text variant="display-italic-m">Log In</Text>
            </View>
            <Text variant="body" style={{ textAlign: 'center', color: T.ink2 }}>
              Book, perform, and get paid — all in one place.
            </Text>
          </View>
        </View>

        {/* Auth actions */}
        <View style={{ gap: T.sp4 }}>
          <SocialButton
            label="Continue with Google"
            icon={<GoogleMark />}
            loading={googleSignIn.isPending}
            onPress={() => googleSignIn.mutate()}
          />
          <SocialButton
            label="Continue with Apple"
            icon={<AppleMark />}
            loading={appleSignIn.isPending}
            onPress={() => appleSignIn.mutate()}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: T.sp3,
              marginVertical: T.sp1,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: T.line }} />
            <Text variant="caption" color={T.ink3}>
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: T.line }} />
          </View>

          <Button label="Sign in with password" onPress={() => router.push('/(auth)/sign-in')} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: T.sp2 }}>
            <Text variant="body" color={T.ink3}>
              Don't have an account?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/sign-up')} hitSlop={8}>
              <Text variant="body-strong" color={T.ink}>
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SocialButton({
  label,
  icon,
  loading,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: T.buttonHeight,
        borderRadius: T.rPill,
        borderWidth: 1,
        borderColor: T.line,
        backgroundColor: T.surface,
        gap: T.sp3,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? <ActivityIndicator color={T.ink3} size="small" /> : icon}
      <Text variant="body-strong">{label}</Text>
    </TouchableOpacity>
  );
}

function GoogleMark() {
  return (
    <RNText style={{ fontFamily: T.sansSemiBold, fontSize: 15, color: T.ink, lineHeight: 20 }}>
      G
    </RNText>
  );
}

function AppleMark() {
  return (
    <RNText style={{ fontFamily: T.sansSemiBold, fontSize: 17, color: T.ink, lineHeight: 22 }}>
      {'\u{F8FF}'}
    </RNText>
  );
}

function CJMark() {
  return (
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: T.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="display-s" color={T.ink}>
        J
      </Text>
      <View
        style={{
          position: 'absolute',
          width: 22,
          height: 22,
          backgroundColor: T.bg,
          bottom: -2,
          right: -2,
        }}
      />
    </View>
  );
}
