import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { useSaveArtistDetails } from '@/features/artist/mutations';
import {
  ARTIST_CATEGORIES,
  type ArtistDetailsValues,
  artistDetailsSchema,
  LANGUAGES,
  PRICE_UNITS,
} from '@/features/artist/schema';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';

const TOTAL_STEPS = 4;

export default function ArtistDetails() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const saveDetails = useSaveArtistDetails();

  const { control, handleSubmit, getValues, setValue, trigger } = useForm<ArtistDetailsValues>({
    resolver: zodResolver(artistDetailsSchema),
    defaultValues: {
      bio: '',
      categories: [],
      years_experience: undefined,
      languages: [],
      base_price: undefined,
      price_unit: 'per_event',
      service_radius_km: undefined,
    },
  });

  async function goNext() {
    const fieldsPerStep: (keyof ArtistDetailsValues)[][] = [
      ['bio'],
      ['categories'],
      ['years_experience', 'languages'],
      ['base_price', 'price_unit', 'service_radius_km'],
    ];
    if (!DEMO_MODE) {
      const valid = await trigger(fieldsPerStep[step]);
      if (!valid) return;
    }
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else if (DEMO_MODE) {
      router.push('/(auth)/setup/artist/id');
    } else {
      handleSubmit(async (values) => {
        await saveDetails.mutateAsync(values);
        router.push('/(auth)/setup/artist/id');
      })();
    }
  }

  function skip() {
    if (step === 1 && !DEMO_MODE) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else if (DEMO_MODE) {
      router.push('/(auth)/setup/artist/id');
    } else {
      handleSubmit(async (values) => {
        await saveDetails.mutateAsync(values);
        router.push('/(auth)/setup/artist/id');
      })();
    }
  }

  const canSkip = step !== 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: T.sp7 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable fixed-length dots
            <StepDot key={i} active={i === step} done={i < step} />
          ))}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: T.sp7, paddingBottom: T.sp9 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && <StepBio control={control} />}
          {step === 1 && (
            <StepCategories control={control} setValue={setValue} getValues={getValues} />
          )}
          {step === 2 && (
            <StepExperience control={control} setValue={setValue} getValues={getValues} />
          )}
          {step === 3 && (
            <StepPricing control={control} setValue={setValue} getValues={getValues} />
          )}
        </ScrollView>

        <View style={{ paddingHorizontal: T.sp7, paddingBottom: T.sp9, gap: T.sp3 }}>
          <Button label="Continue" onPress={goNext} loading={saveDetails.isPending} />
          {canSkip && (
            <Pressable onPress={skip} hitSlop={12} style={{ alignItems: 'center' }}>
              <Text variant="body" color={T.ink3}>
                Skip this step
              </Text>
            </Pressable>
          )}
          {saveDetails.isError && (
            <Text variant="caption" color={T.accent} style={{ textAlign: 'center' }}>
              Something went wrong. Please try again.
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  const width = useSharedValue(active ? 24 : 8);
  useEffect(() => {
    width.value = withTiming(active ? 24 : 8, { duration: 200 });
  }, [active, width]);
  const style = useAnimatedStyle(() => ({ width: width.value }));
  return (
    <Animated.View
      style={[
        style,
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: done ? T.accentSoftBorder : active ? T.accent : T.line,
        },
      ]}
    />
  );
}

function StepBio({
  control,
}: {
  control: ReturnType<typeof useForm<ArtistDetailsValues>>['control'];
}) {
  const { field: bioField } = useController({ control, name: 'bio' });

  return (
    <View style={{ gap: T.sp8 }}>
      <StepHeading upright="Tell us" italic="about yourself" />

      <View style={{ gap: T.sp6 }}>
        <View style={{ gap: T.sp2 }}>
          <Text variant="caption" color={T.ink3}>
            SHORT BIO
          </Text>
          <TextInput
            value={bioField.value ?? ''}
            onChangeText={bioField.onChange}
            onBlur={bioField.onBlur}
            placeholder="What makes your performances unforgettable?"
            placeholderTextColor={T.ink3}
            multiline
            numberOfLines={4}
            style={[inputStyle, { height: 120, textAlignVertical: 'top', paddingTop: T.sp4 }]}
          />
          <Text variant="caption" color={T.ink3} style={{ textAlign: 'right' }}>
            {(bioField.value ?? '').length}/500
          </Text>
        </View>
      </View>
    </View>
  );
}

function StepCategories({
  control,
  setValue,
  getValues,
}: {
  control: ReturnType<typeof useForm<ArtistDetailsValues>>['control'];
  setValue: ReturnType<typeof useForm<ArtistDetailsValues>>['setValue'];
  getValues: ReturnType<typeof useForm<ArtistDetailsValues>>['getValues'];
}) {
  const { fieldState } = useController({ control, name: 'categories' });
  const [selected, setSelected] = useState<string[]>(getValues('categories') ?? []);

  function toggle(value: string) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(next);
    setValue('categories', next, { shouldValidate: true });
  }

  return (
    <View style={{ gap: T.sp8 }}>
      <StepHeading upright="What do" italic="you do?" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: T.sp2 }}>
        {ARTIST_CATEGORIES.map((cat) => {
          const active = selected.includes(cat.value);
          return (
            <Pressable
              key={cat.value}
              onPress={() => toggle(cat.value)}
              style={{
                paddingHorizontal: T.sp5,
                paddingVertical: T.sp2,
                borderRadius: T.rPill,
                borderWidth: 1.5,
                borderColor: active ? T.accent : T.line,
                backgroundColor: active ? T.accentSoftFill : T.surface,
              }}
            >
              <Text variant="body-strong" color={active ? T.accent : T.ink2}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {fieldState.error && (
        <Text variant="caption" color={T.accent}>
          {fieldState.error.message}
        </Text>
      )}
    </View>
  );
}

function StepExperience({
  control,
  setValue,
  getValues,
}: {
  control: ReturnType<typeof useForm<ArtistDetailsValues>>['control'];
  setValue: ReturnType<typeof useForm<ArtistDetailsValues>>['setValue'];
  getValues: ReturnType<typeof useForm<ArtistDetailsValues>>['getValues'];
}) {
  const { field: yearsField } = useController({ control, name: 'years_experience' });
  const [selectedLangs, setSelectedLangs] = useState<string[]>(getValues('languages') ?? []);

  function toggleLang(lang: string) {
    const next = selectedLangs.includes(lang)
      ? selectedLangs.filter((l) => l !== lang)
      : [...selectedLangs, lang];
    setSelectedLangs(next);
    setValue('languages', next);
  }

  return (
    <View style={{ gap: T.sp8 }}>
      <StepHeading upright="Your" italic="experience" />

      <View style={{ gap: T.sp6 }}>
        <View style={{ gap: T.sp2 }}>
          <Text variant="caption" color={T.ink3}>
            YEARS ACTIVE
          </Text>
          <TextInput
            value={yearsField.value?.toString() ?? ''}
            onChangeText={(t) => yearsField.onChange(t ? Number(t) : undefined)}
            onBlur={yearsField.onBlur}
            keyboardType="number-pad"
            placeholder="e.g. 5"
            placeholderTextColor={T.ink3}
            style={inputStyle}
          />
        </View>

        <View style={{ gap: T.sp3 }}>
          <Text variant="caption" color={T.ink3}>
            LANGUAGES YOU PERFORM IN
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: T.sp2 }}>
            {LANGUAGES.map((lang) => {
              const active = selectedLangs.includes(lang);
              return (
                <Pressable
                  key={lang}
                  onPress={() => toggleLang(lang)}
                  style={{
                    paddingHorizontal: T.sp4,
                    paddingVertical: T.sp2,
                    borderRadius: T.rPill,
                    borderWidth: 1.5,
                    borderColor: active ? T.accent : T.line,
                    backgroundColor: active ? T.accentSoftFill : T.surface,
                  }}
                >
                  <Text variant="body-strong" color={active ? T.accent : T.ink2}>
                    {lang}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function StepPricing({
  control,
  setValue,
  getValues,
}: {
  control: ReturnType<typeof useForm<ArtistDetailsValues>>['control'];
  setValue: ReturnType<typeof useForm<ArtistDetailsValues>>['setValue'];
  getValues: ReturnType<typeof useForm<ArtistDetailsValues>>['getValues'];
}) {
  const { field: priceField } = useController({ control, name: 'base_price' });
  const { field: radiusField } = useController({ control, name: 'service_radius_km' });
  const [selectedUnit, setSelectedUnit] = useState<string>(getValues('price_unit') ?? 'per_event');

  function selectUnit(unit: string) {
    setSelectedUnit(unit);
    setValue('price_unit', unit as ArtistDetailsValues['price_unit']);
  }

  return (
    <View style={{ gap: T.sp8 }}>
      <StepHeading upright="Your" italic="rates" />

      <View style={{ gap: T.sp6 }}>
        <View style={{ gap: T.sp2 }}>
          <Text variant="caption" color={T.ink3}>
            STARTING RATE (₹)
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: T.line,
              borderRadius: T.rTile,
              backgroundColor: T.surface,
              paddingHorizontal: T.sp5,
            }}
          >
            <Text variant="body-strong" color={T.ink3} style={{ marginRight: T.sp2 }}>
              ₹
            </Text>
            <TextInput
              value={priceField.value?.toString() ?? ''}
              onChangeText={(t) => priceField.onChange(t ? Number(t) : undefined)}
              onBlur={priceField.onBlur}
              keyboardType="number-pad"
              placeholder="5000"
              placeholderTextColor={T.ink3}
              style={[inputStyle, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]}
            />
          </View>
        </View>

        <View style={{ gap: T.sp3 }}>
          <Text variant="caption" color={T.ink3}>
            RATE TYPE
          </Text>
          <View style={{ flexDirection: 'row', gap: T.sp2 }}>
            {PRICE_UNITS.map((unit) => {
              const active = selectedUnit === unit.value;
              return (
                <Pressable
                  key={unit.value}
                  onPress={() => selectUnit(unit.value)}
                  style={{
                    flex: 1,
                    paddingVertical: T.sp4,
                    borderRadius: T.rTile,
                    borderWidth: 1.5,
                    borderColor: active ? T.accent : T.line,
                    backgroundColor: active ? T.accentSoftFill : T.surface,
                    alignItems: 'center',
                  }}
                >
                  <Text variant="body-strong" color={active ? T.accent : T.ink2}>
                    {unit.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: T.sp2 }}>
          <Text variant="caption" color={T.ink3}>
            HOW FAR WILL YOU TRAVEL? (KM)
          </Text>
          <TextInput
            value={radiusField.value?.toString() ?? ''}
            onChangeText={(t) => radiusField.onChange(t ? Number(t) : undefined)}
            onBlur={radiusField.onBlur}
            keyboardType="number-pad"
            placeholder="e.g. 100"
            placeholderTextColor={T.ink3}
            style={inputStyle}
          />
        </View>
      </View>
    </View>
  );
}

function StepHeading({ upright, italic }: { upright: string; italic: string }) {
  return (
    <View style={{ gap: T.sp2, paddingTop: T.sp6 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Text variant="display-m">{upright} </Text>
        <Text variant="display-italic-m">{italic}</Text>
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
