import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FormField, Text } from '@/components/ui';
import { useForgotPassword } from '@/features/auth/mutations';
import { type ForgotPasswordValues, forgotPasswordSchema } from '@/features/auth/schema';
import { T } from '@/lib/theme';

export default function ForgotPassword() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setError(null);
    try {
      await forgotPassword.mutateAsync(values.email);
      setSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingHorizontal: T.sp7, paddingTop: T.sp5 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <BackChevron />
        </Pressable>
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9,
          justifyContent: 'space-between',
        }}
      >
        {/* Header */}
        <View style={{ paddingTop: T.sp8, gap: T.sp3, alignItems: 'center' }}>
          <CJMark />
          <View style={{ alignItems: 'center', paddingTop: T.sp3 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text variant="display-s">Reset </Text>
              <Text variant="display-italic-s">Password</Text>
            </View>
          </View>
          {sent ? (
            <Text variant="body" style={{ textAlign: 'center', paddingTop: T.sp3 }}>
              Check your inbox — we've sent a password reset link.
            </Text>
          ) : null}
        </View>

        {/* Form */}
        {!sent ? (
          <View style={{ gap: T.sp6 }}>
            <FormField
              control={control}
              name="email"
              label="EMAIL"
              inputProps={{ keyboardType: 'email-address', autoComplete: 'email' }}
            />
            {error ? (
              <Text variant="caption" color={T.accent}>
                {error}
              </Text>
            ) : null}
          </View>
        ) : (
          <View />
        )}

        {/* CTA */}
        <View style={{ gap: T.sp4 }}>
          {sent ? (
            <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} />
          ) : (
            <Button
              label="Get password reset email"
              onPress={handleSubmit(onSubmit)}
              loading={forgotPassword.isPending}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function BackChevron() {
  return (
    <View
      style={{
        width: 11,
        height: 11,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: T.ink,
        transform: [{ rotate: '45deg' }],
      }}
    />
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
