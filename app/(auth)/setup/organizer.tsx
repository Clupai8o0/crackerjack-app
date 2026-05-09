import { zodResolver } from '@hookform/resolvers/zod';
import { useController, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Glow, Text } from '@/components/ui';
import { useCompleteOrganizerSetup } from '@/features/artist/mutations';
import { type OrganizerSetupValues, organizerSetupSchema } from '@/features/artist/schema';
import { useAuthStore } from '@/features/auth/store';
import { T } from '@/lib/theme';

export default function OrganizerSetup() {
  const completeSetup = useCompleteOrganizerSetup();
  const user = useAuthStore((s) => s.user);

  const { control, handleSubmit } = useForm<OrganizerSetupValues>({
    resolver: zodResolver(organizerSetupSchema),
    defaultValues: {
      display_name: user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '',
      city: '',
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <Glow size={260} style={{ top: -40, alignSelf: 'center', opacity: 0.5 }} />
      <KeyboardAvoidingView
        style={{ flex: 1, paddingHorizontal: T.sp7 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: T.sp9 }}>
          <View style={{ paddingTop: T.sp9, gap: T.sp8 }}>
            <View style={{ gap: T.sp2 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text variant="display-m">Almost </Text>
                <Text variant="display-italic-m">there</Text>
              </View>
              <Text variant="body" color={T.ink2}>
                Just a couple of details to get you started.
              </Text>
            </View>

            <View style={{ gap: T.sp6 }}>
              <FieldRow
                control={control}
                name="display_name"
                label="YOUR NAME"
                placeholder="How should artists address you?"
              />
              <FieldRow
                control={control}
                name="city"
                label="YOUR CITY"
                placeholder="e.g. Mumbai, Goa, Delhi"
              />
            </View>
          </View>

          <Button
            label="Start exploring"
            onPress={handleSubmit((v) => completeSetup.mutate(v))}
            loading={completeSetup.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldRow({
  control,
  name,
  label,
  placeholder,
}: {
  control: ReturnType<typeof useForm<OrganizerSetupValues>>['control'];
  name: keyof OrganizerSetupValues;
  label: string;
  placeholder: string;
}) {
  const { field, fieldState } = useController({ control, name });
  return (
    <View style={{ gap: T.sp2 }}>
      <Text variant="caption" color={T.ink3}>
        {label}
      </Text>
      <TextInput
        value={field.value}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        placeholderTextColor={T.ink3}
        style={{
          height: T.buttonHeight,
          borderWidth: 1.5,
          borderColor: T.line,
          borderRadius: T.rTile,
          backgroundColor: T.surface,
          paddingHorizontal: T.sp5,
          color: T.ink,
          fontFamily: T.sans,
          fontSize: 15,
        }}
      />
      {fieldState.error && (
        <Text variant="caption" color={T.accent}>
          {fieldState.error.message}
        </Text>
      )}
    </View>
  );
}
