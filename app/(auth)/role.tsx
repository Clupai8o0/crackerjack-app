import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { useSelectRole } from '@/features/auth/mutations';
import { useAuthStore } from '@/features/auth/store';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';
import type { UserRole } from '@/types/database';

type Role = 'artist' | 'organizer' | 'attendee';

const ROLES: { value: Role; title: string; subtitle: string }[] = [
  {
    value: 'artist',
    title: "I'm an artist",
    subtitle: 'I perform at events — DJ, photographer, dancer, and more.',
  },
  {
    value: 'organizer',
    title: 'I organize events',
    subtitle: 'I host events and need to book talent.',
  },
  {
    value: 'attendee',
    title: "I'm just here to look",
    subtitle: "Discover artists and follow events. (You can't book — yet.)",
  },
];

export default function RoleSelect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const selectRole = useSelectRole();
  const [selected, setSelected] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    if (!selected) return;
    if (DEMO_MODE) {
      const next =
        selected === 'artist'
          ? '/(auth)/setup/artist/details'
          : selected === 'organizer'
            ? '/(auth)/setup/organizer'
            : '/(auth)/setup/attendee';
      router.push(next);
      return;
    }
    if (!user) return;
    setError(null);
    try {
      await selectRole.mutateAsync({ userId: user.id, role: selected as UserRole });
      setRole(selected as UserRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
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
        <View style={{ paddingTop: T.sp9, gap: T.sp3 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text variant="display-m">What brings you </Text>
            <Text variant="display-italic-m">here?</Text>
          </View>
        </View>

        {/* Role options */}
        <View style={{ gap: T.sp3 }}>
          {ROLES.map((role) => {
            const active = selected === role.value;
            return (
              <Pressable
                key={role.value}
                onPress={() => setSelected(role.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={{
                  borderRadius: T.rTile,
                  borderWidth: 1.5,
                  borderColor: active ? T.accent : T.line,
                  backgroundColor: active ? T.accentSoftFill : T.surface,
                  paddingHorizontal: T.sp6,
                  paddingVertical: T.sp5,
                  gap: T.sp2,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: active ? T.accent : T.ink3,
                    backgroundColor: active ? T.accent : 'transparent',
                    marginRight: T.sp3,
                  }}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body-strong" color={active ? T.accent : T.ink}>
                    {role.title}
                  </Text>
                  <Text variant="caption">{role.subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: T.sp3 }}>
          {error ? (
            <Text variant="caption" color={T.accent} style={{ textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
          <Button
            label="Continue"
            onPress={onConfirm}
            disabled={!selected}
            loading={selectRole.isPending}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
