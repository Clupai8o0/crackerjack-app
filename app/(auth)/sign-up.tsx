import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardScreen } from '@/components/patterns';
import { Button, FormField, Glow, Text } from '@/components/ui';
import { useSignUp } from '@/features/auth/mutations';
import { type SignUpValues, signUpSchema } from '@/features/auth/schema';
import { T } from '@/lib/theme';

export default function SignUp() {
  const router = useRouter();
  const signUp = useSignUp();
  const [authError, setAuthError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUpValues) {
    setAuthError(null);
    try {
      await signUp.mutateAsync(values);
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-up failed. Try again.';
      setAuthError(msg);
    }
  }

  if (done) {
    return (
      <KeyboardScreen>
        <View style={{ flex: 1, justifyContent: 'center', gap: T.sp8, paddingTop: T.sp9 }}>
          <View style={{ gap: T.sp2 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text variant="display-m">Check your </Text>
              <Text variant="display-italic-m">email</Text>
            </View>
            <Text variant="body">
              We've sent a confirmation link. Click it to activate your account, then come back and
              sign in.
            </Text>
          </View>
          <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} />
        </View>
      </KeyboardScreen>
    );
  }

  return (
    <KeyboardScreen>
      <Glow style={{ top: -60, right: -60, opacity: 0.6 }} />

      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: T.sp9 }}>
        <View style={{ gap: T.sp2 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant="display-m">Join </Text>
            <Text variant="display-italic-m">Crackerjack</Text>
          </View>
          <Text variant="body">India's marketplace for performing artists.</Text>
        </View>

        <View style={{ gap: T.sp8 }}>
          <View style={{ gap: T.sp6 }}>
            <FormField control={control} name="displayName" label="YOUR NAME" />
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
          </View>

          {authError ? (
            <Text variant="caption" color={T.accent}>
              {authError}
            </Text>
          ) : null}

          <Button
            label="Create account"
            onPress={handleSubmit(onSubmit)}
            loading={signUp.isPending}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: T.sp2 }}>
            <Text variant="body">Already have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/sign-in')} hitSlop={8}>
              <Text variant="body-strong" color={T.ink}>
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardScreen>
  );
}
