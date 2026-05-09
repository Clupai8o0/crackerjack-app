import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FormField, Text } from '@/components/ui';
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
        <View style={{ paddingTop: T.sp9, gap: T.sp3, alignItems: 'center' }}>
          <CJMark />
          <View style={{ alignItems: 'center', gap: T.sp2, paddingTop: T.sp3 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text variant="display-s">Login to </Text>
              <Text variant="display-italic-s">Your Account</Text>
            </View>
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
            inputProps={{ secureTextEntry: true, autoComplete: 'password' }}
          />

          {authError ? (
            <Text variant="caption" color={T.accent}>
              {authError}
            </Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={{ gap: T.sp5 }}>
          <Button label="Sign in" onPress={handleSubmit(onSubmit)} loading={signIn.isPending} />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignItems: 'center' }}
            hitSlop={8}
          >
            <Text variant="body-strong" color={T.accent}>
              Forgot the password?
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: T.sp2 }}>
            <Text variant="body">Don't have an account?</Text>
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
