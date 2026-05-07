import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardScreen } from '@/components/patterns';
import { Button, FormField, Text } from '@/components/ui';
import { useSignInWithPhone, useVerifyOtp } from '@/features/auth/mutations';
import { type OtpValues, otpSchema, type PhoneValues, phoneSchema } from '@/features/auth/schema';
import { T } from '@/lib/theme';

export default function Otp() {
  const router = useRouter();
  const sendOtp = useSignInWithPhone();
  const verifyOtp = useVerifyOtp();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneValues>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  async function onSendOtp(values: PhoneValues) {
    setError(null);
    try {
      await sendOtp.mutateAsync(values.phone);
      setPhone(values.phone);
      setStep('verify');
    } catch {
      // Indian SMS delivery can be flaky — suggest email fallback
      setError('Could not send OTP. Try signing in with email instead.');
    }
  }

  async function onVerifyOtp(values: OtpValues) {
    setError(null);
    try {
      await verifyOtp.mutateAsync({ phone, token: values.otp });
    } catch {
      setError('Invalid or expired OTP. Request a new one.');
    }
  }

  return (
    <KeyboardScreen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: T.sp9 }}>
        <View style={{ gap: T.sp2 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant="display-m">{step === 'phone' ? 'Your ' : 'Enter '}</Text>
            <Text variant="display-italic-m">{step === 'phone' ? 'phone' : 'OTP'}</Text>
          </View>
          <Text variant="body">
            {step === 'phone'
              ? 'Enter your Indian mobile number (+91XXXXXXXXXX).'
              : `We sent a 6-digit code to ${phone}.`}
          </Text>
        </View>

        <View style={{ gap: T.sp8 }}>
          {step === 'phone' ? (
            <View style={{ gap: T.sp6 }}>
              <FormField
                control={phoneForm.control}
                name="phone"
                label="MOBILE"
                inputProps={{ keyboardType: 'phone-pad', autoComplete: 'tel' }}
              />
              {error ? (
                <Text variant="caption" color={T.accent}>
                  {error}
                </Text>
              ) : null}
              <Button
                label="Send OTP"
                onPress={phoneForm.handleSubmit(onSendOtp)}
                loading={sendOtp.isPending}
              />
            </View>
          ) : (
            <View style={{ gap: T.sp6 }}>
              <FormField
                control={otpForm.control}
                name="otp"
                label="OTP"
                inputProps={{ keyboardType: 'number-pad', autoComplete: 'one-time-code' }}
              />
              {error ? (
                <Text variant="caption" color={T.accent}>
                  {error}
                </Text>
              ) : null}
              <Button
                label="Verify"
                onPress={otpForm.handleSubmit(onVerifyOtp)}
                loading={verifyOtp.isPending}
              />
              <Pressable
                onPress={() => {
                  setStep('phone');
                  setError(null);
                }}
                style={{ alignItems: 'center' }}
                hitSlop={8}
              >
                <Text variant="body" color={T.ink2}>
                  Use a different number
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={() => router.replace('/(auth)/sign-in')}
            style={{ alignItems: 'center' }}
            hitSlop={8}
          >
            <Text variant="body" color={T.ink3}>
              Sign in with email instead
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardScreen>
  );
}
