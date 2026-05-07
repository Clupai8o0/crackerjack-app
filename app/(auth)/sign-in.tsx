import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardScreen } from '@/components/patterns';
import { Button, FormField, Glow, Text } from '@/components/ui';
import { useSignIn } from '@/features/auth/mutations';
import { type SignInValues, signInSchema } from '@/features/auth/schema';
import { T } from '@/lib/theme';

export default function SignIn() {
  const router = useRouter();
  const signIn = useSignIn();
  const [authError, setAuthError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInValues) {
    setAuthError(null);
    try {
      await signIn.mutateAsync(values);
    } catch {
      setAuthError('Wrong email or password. Try again.');
    }
  }

  return (
    <KeyboardScreen>
      <Glow style={{ top: -60, left: -60, opacity: 0.6 }} />

      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: T.sp9 }}>
        <View style={{ gap: T.sp2 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant="display-m">Welcome </Text>
            <Text variant="display-italic-m">back</Text>
          </View>
          <Text variant="body">Sign in to your Crackerjack account.</Text>
        </View>

        <View style={{ gap: T.sp8 }}>
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
              inputProps={{ secureTextEntry: true, autoComplete: 'password' }}
            />
          </View>

          {authError ? (
            <Text variant="caption" color={T.accent}>
              {authError}
            </Text>
          ) : null}

          <Button label="Sign in" onPress={handleSubmit(onSubmit)} loading={signIn.isPending} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: T.sp2 }}>
            <Text variant="body">Don't have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/sign-up')} hitSlop={8}>
              <Text variant="body-strong" color={T.ink}>
                Sign up
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/otp')}
            style={{ alignItems: 'center' }}
            hitSlop={8}
          >
            <Text variant="body" color={T.ink2}>
              Sign in with phone instead
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardScreen>
  );
}
