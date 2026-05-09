import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text as RNText, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FormField, Text } from '@/components/ui';
import { useSignInWithApple, useSignInWithGoogle, useSignUp } from '@/features/auth/mutations';
import { type SignUpValues, signUpSchema } from '@/features/auth/schema';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';

export default function SignUp() {
  const router = useRouter();
  const signUp = useSignUp();
  const googleSignIn = useSignInWithGoogle();
  const appleSignIn = useSignInWithApple();
  const [authError, setAuthError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUpValues) {
    if (DEMO_MODE) {
      router.push('/(auth)/verify-phone');
      return;
    }
    setAuthError(null);
    try {
      await signUp.mutateAsync(values);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Sign-up failed. Try again.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9,
          justifyContent: 'space-between',
        }}
      >
        {/* Header */}
        <View style={{ paddingTop: T.sp9, alignItems: 'center', gap: T.sp3 }}>
          <CJMark />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Text variant="display-s">Create New </Text>
            <Text variant="display-italic-s">Account</Text>
          </View>
        </View>

        {/* Form */}
        <View style={{ gap: T.sp6 }}>
          <FormField
            control={control}
            name="email"
            label="EMAIL"
            inputProps={{ keyboardType: 'email-address', autoComplete: 'email' }}
          />
          <FormField
            control={control}
            name="password"
            label="PASSWORD"
            inputProps={{ secureTextEntry: true, autoComplete: 'new-password' }}
          />
          {authError ? (
            <Text variant="caption" color={T.ink2}>
              {authError}
            </Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={{ gap: T.sp5 }}>
          <Button label="Sign up" onPress={handleSubmit(onSubmit)} loading={signUp.isPending} />

          <Divider />

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

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: T.sp2 }}>
            <Text variant="body" color={T.ink3}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/sign-in')} hitSlop={8}>
              <Text variant="body-strong" color={T.ink}>
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Divider() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp3 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: T.line }} />
      <Text variant="caption" color={T.ink3}>
        or continue with
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: T.line }} />
    </View>
  );
}

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
        width: 72,
        height: 72,
        borderRadius: 36,
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
          width: 20,
          height: 20,
          backgroundColor: T.bg,
          bottom: -2,
          right: -2,
        }}
      />
    </View>
  );
}
