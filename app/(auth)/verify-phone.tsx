import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardScreen } from '@/components/patterns';
import { Button, FormField, Text } from '@/components/ui';
import { useSendPhoneOtp, useSignOut, useVerifyPhoneOtp } from '@/features/auth/mutations';
import { type OtpValues, otpSchema, type PhoneValues, phoneSchema } from '@/features/auth/schema';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';

const RESEND_COOLDOWN = 30;

export default function VerifyPhone() {
  const router = useRouter();
  const sendOtp = useSendPhoneOtp();
  const verifyOtp = useVerifyPhoneOtp();
  const signOut = useSignOut();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '+91' },
  });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCountdown() {
    setCountdown(RESEND_COOLDOWN);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function onSendOtp(values: PhoneValues) {
    if (DEMO_MODE) {
      setPhone(values.phone);
      setStep('verify');
      startCountdown();
      return;
    }
    setSendError(null);
    try {
      await sendOtp.mutateAsync(values.phone);
      setPhone(values.phone);
      setStep('verify');
      startCountdown();
    } catch {
      setSendError("Couldn't send. Try again.");
    }
  }

  async function onVerifyOtp(values: OtpValues) {
    if (DEMO_MODE) {
      router.push('/(auth)/setup/profile');
      return;
    }
    setVerifyError(null);
    try {
      await verifyOtp.mutateAsync({ phone, token: values.otp });
    } catch {
      setVerifyError('Wrong code. Request a new one.');
    }
  }

  async function onResend() {
    if (countdown > 0) return;
    setSendError(null);
    setVerifyError(null);
    try {
      await sendOtp.mutateAsync(phone);
      startCountdown();
    } catch {
      setSendError("Couldn't send. Try again.");
    }
  }

  return (
    <KeyboardScreen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: T.sp9 }}>
        <View style={{ gap: T.sp2 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {step === 'phone' ? (
              <>
                <Text variant="display-m">Verify your </Text>
                <Text variant="display-italic-m">number</Text>
              </>
            ) : (
              <>
                <Text variant="display-m">Enter the </Text>
                <Text variant="display-italic-m">code</Text>
              </>
            )}
          </View>
          {step === 'phone' ? (
            <Text variant="body">{"We'll text you a 6-digit code."}</Text>
          ) : (
            <Pressable onPress={() => setStep('phone')} hitSlop={8}>
              <Text variant="body">
                {'Sent to '}
                <Text variant="body-strong">{phone}</Text>
                {'. Tap to change.'}
              </Text>
            </Pressable>
          )}
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
              {sendError ? (
                <Text variant="caption" color={T.accent}>
                  {sendError}
                </Text>
              ) : null}
              <Button
                label="Send code"
                onPress={phoneForm.handleSubmit(onSendOtp)}
                loading={sendOtp.isPending}
              />
            </View>
          ) : (
            <View style={{ gap: T.sp6 }}>
              <FormField
                control={otpForm.control}
                name="otp"
                label="6-DIGIT CODE"
                inputProps={{ keyboardType: 'number-pad', autoComplete: 'one-time-code' }}
              />
              {verifyError ? (
                <Text variant="caption" color={T.accent}>
                  {verifyError}
                </Text>
              ) : null}
              {sendError ? (
                <Text variant="caption" color={T.accent}>
                  {sendError}
                </Text>
              ) : null}
              <Button
                label="Verify"
                onPress={otpForm.handleSubmit(onVerifyOtp)}
                loading={verifyOtp.isPending}
              />
              <Pressable
                onPress={onResend}
                disabled={countdown > 0 || sendOtp.isPending}
                style={{ alignItems: 'center' }}
                hitSlop={8}
              >
                <Text variant="body" color={countdown > 0 ? T.ink3 : T.ink2}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable onPress={() => signOut.mutate()} style={{ alignItems: 'center' }} hitSlop={8}>
            <Text variant="caption" color={T.ink3}>
              Sign out
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardScreen>
  );
}
