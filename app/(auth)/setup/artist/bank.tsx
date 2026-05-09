import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { useSavePayoutAccount, useSubmitArtistApplication } from '@/features/artist/mutations';
import { type BankDetailsValues, bankDetailsSchema } from '@/features/artist/schema';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';

type PayoutMode = 'upi' | 'bank';

export default function ArtistBank() {
  const router = useRouter();
  const [mode, setMode] = useState<PayoutMode>('upi');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const savePayout = useSavePayoutAccount();
  const submitApplication = useSubmitArtistApplication();

  const { control, handleSubmit } = useForm<BankDetailsValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      account_holder: '',
      account_number: '',
      ifsc: '',
      upi_id: '',
    },
  });

  async function onSubmit(values: BankDetailsValues) {
    if (DEMO_MODE) {
      router.replace('/(auth)/setup/artist/submitted');
      return;
    }
    setSubmitError(null);
    try {
      await savePayout.mutateAsync(values);
      await submitApplication.mutateAsync();
      router.replace('/(auth)/setup/artist/submitted');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    }
  }

  const isPending = savePayout.isPending || submitApplication.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: T.sp7, paddingBottom: T.sp9 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: T.sp6, gap: T.sp8 }}>
            <View style={{ gap: T.sp2 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text variant="display-m">Where should we </Text>
                <Text variant="display-italic-m">pay you?</Text>
              </View>
              <Text variant="body" color={T.ink2}>
                Choose UPI for fastest payouts, or enter your bank account.
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                backgroundColor: T.surface,
                borderRadius: T.rPill,
                padding: 4,
                borderWidth: 1,
                borderColor: T.line,
              }}
            >
              <ModeTab label="UPI" active={mode === 'upi'} onPress={() => setMode('upi')} />
              <ModeTab
                label="Bank account"
                active={mode === 'bank'}
                onPress={() => setMode('bank')}
              />
            </View>

            {mode === 'upi' ? <UpiFields control={control} /> : <BankFields control={control} />}

            {submitError && (
              <Text variant="caption" color={T.accent}>
                {submitError}
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: T.sp7, paddingBottom: T.sp9 }}>
          <Button label="Submit application" onPress={handleSubmit(onSubmit)} loading={isPending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: T.pillHeight,
        borderRadius: T.rPill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? T.ink : 'transparent',
      }}
    >
      <Text variant="body-strong" color={active ? T.inkDeep : T.ink3}>
        {label}
      </Text>
    </Pressable>
  );
}

function UpiFields({
  control,
}: {
  control: ReturnType<typeof useForm<BankDetailsValues>>['control'];
}) {
  const { field, fieldState } = useController({ control, name: 'upi_id' });
  return (
    <View style={{ gap: T.sp2 }}>
      <Text variant="caption" color={T.ink3}>
        UPI ID
      </Text>
      <TextInput
        value={field.value ?? ''}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        placeholder="name@upi"
        placeholderTextColor={T.ink3}
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
      />
      {fieldState.error && (
        <Text variant="caption" color={T.accent}>
          {fieldState.error.message}
        </Text>
      )}
    </View>
  );
}

function BankFields({
  control,
}: {
  control: ReturnType<typeof useForm<BankDetailsValues>>['control'];
}) {
  const { field: holderField, fieldState: holderState } = useController({
    control,
    name: 'account_holder',
  });
  const { field: accountField, fieldState: accountState } = useController({
    control,
    name: 'account_number',
  });
  const { field: ifscField, fieldState: ifscState } = useController({ control, name: 'ifsc' });

  return (
    <View style={{ gap: T.sp6 }}>
      <View style={{ gap: T.sp2 }}>
        <Text variant="caption" color={T.ink3}>
          ACCOUNT HOLDER NAME
        </Text>
        <TextInput
          value={holderField.value ?? ''}
          onChangeText={holderField.onChange}
          onBlur={holderField.onBlur}
          placeholder="Full name as on bank account"
          placeholderTextColor={T.ink3}
          style={inputStyle}
        />
        {holderState.error && (
          <Text variant="caption" color={T.accent}>
            {holderState.error.message}
          </Text>
        )}
      </View>

      <View style={{ gap: T.sp2 }}>
        <Text variant="caption" color={T.ink3}>
          ACCOUNT NUMBER
        </Text>
        <TextInput
          value={accountField.value ?? ''}
          onChangeText={accountField.onChange}
          onBlur={accountField.onBlur}
          placeholder="e.g. 001234567890"
          placeholderTextColor={T.ink3}
          keyboardType="number-pad"
          style={inputStyle}
        />
        {accountState.error && (
          <Text variant="caption" color={T.accent}>
            {accountState.error.message}
          </Text>
        )}
      </View>

      <View style={{ gap: T.sp2 }}>
        <Text variant="caption" color={T.ink3}>
          IFSC CODE
        </Text>
        <TextInput
          value={ifscField.value ?? ''}
          onChangeText={(t) => ifscField.onChange(t.toUpperCase())}
          onBlur={ifscField.onBlur}
          placeholder="e.g. HDFC0001234"
          placeholderTextColor={T.ink3}
          autoCapitalize="characters"
          style={inputStyle}
        />
        {ifscState.error && (
          <Text variant="caption" color={T.accent}>
            {ifscState.error.message}
          </Text>
        )}
      </View>
    </View>
  );
}

const inputStyle = {
  height: T.buttonHeight,
  borderWidth: 1.5,
  borderColor: T.line,
  borderRadius: T.rTile,
  backgroundColor: T.surface,
  paddingHorizontal: T.sp5,
  color: T.ink,
  fontFamily: T.sans,
  fontSize: 15,
} as const;
