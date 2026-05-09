import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardScreen } from '@/components/patterns';
import { Button, FormField, Text } from '@/components/ui';
import { useUpdateProfileBasics } from '@/features/auth/mutations';
import { type ProfileBasicsValues, profileBasicsSchema } from '@/features/auth/schema';
import { DEMO_MODE } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import { T } from '@/lib/theme';

export default function ProfileSetup() {
  const router = useRouter();
  const updateProfile = useUpdateProfileBasics();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, setValue } = useForm<ProfileBasicsValues>({
    resolver: zodResolver(profileBasicsSchema),
    defaultValues: { display_name: '', city: '', avatar_url: undefined },
  });

  async function pickAvatar() {
    setAvatarError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const { data, error } = await supabase.storage.from('avatars').upload(fileName, uint8Array, {
        contentType: asset.mimeType ?? 'image/jpeg',
        upsert: true,
      });

      if (error) {
        setAvatarError('Could not upload photo. Continue without it.');
        return;
      }

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(data.path);
      setAvatarUri(asset.uri);
      setValue('avatar_url', publicData.publicUrl);
    } catch {
      setAvatarError('Could not upload photo. Continue without it.');
    }
  }

  async function onSubmit(values: ProfileBasicsValues) {
    if (DEMO_MODE) {
      router.push('/(auth)/role');
      return;
    }
    setSubmitError(null);
    try {
      await updateProfile.mutateAsync(values);
    } catch {
      setSubmitError('Something went wrong. Try again.');
    }
  }

  return (
    <KeyboardScreen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: T.sp9 }}>
        <View style={{ gap: T.sp2 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text variant="display-m">Tell us </Text>
            <Text variant="display-italic-m">about you</Text>
          </View>
          <Text variant="body">Just a couple of details to get you started.</Text>
        </View>

        <View style={{ gap: T.sp8 }}>
          <View style={{ alignItems: 'center', gap: T.sp3 }}>
            <Pressable
              onPress={pickAvatar}
              accessibilityRole="button"
              accessibilityLabel="Pick a profile photo"
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 1.5,
                borderColor: avatarUri ? T.accent : T.line,
                backgroundColor: T.surface,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {avatarUri ? (
                <AvatarImage uri={avatarUri} />
              ) : (
                <Text variant="caption" color={T.ink3} style={{ textAlign: 'center' }}>
                  {'Add\nphoto'}
                </Text>
              )}
            </Pressable>
            {avatarError ? (
              <Text variant="caption" color={T.ink3}>
                {avatarError}
              </Text>
            ) : (
              <Text variant="caption" color={T.ink3}>
                Optional
              </Text>
            )}
          </View>

          <View style={{ gap: T.sp6 }}>
            <FormField
              control={control}
              name="display_name"
              label="YOUR NAME"
              inputProps={{
                placeholder: 'How should others address you?',
                placeholderTextColor: T.ink3,
                autoComplete: 'name',
              }}
            />
            <FormField
              control={control}
              name="city"
              label="YOUR CITY"
              inputProps={{
                placeholder: 'e.g. Mumbai, Goa, Delhi',
                placeholderTextColor: T.ink3,
              }}
            />
          </View>

          {submitError ? (
            <Text variant="caption" color={T.accent} style={{ textAlign: 'center' }}>
              {submitError}
            </Text>
          ) : null}

          <Button
            label="Continue"
            onPress={handleSubmit(onSubmit)}
            loading={updateProfile.isPending}
          />
        </View>
      </View>
    </KeyboardScreen>
  );
}

function AvatarImage({ uri }: { uri: string }) {
  const Image = require('expo-image').Image;
  return (
    <Image
      source={{ uri }}
      style={{ width: 96, height: 96, borderRadius: 48 }}
      contentFit="cover"
    />
  );
}
