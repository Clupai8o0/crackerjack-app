import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { useSelectRole } from '@/features/auth/mutations';
import { useAuthStore } from '@/features/auth/store';
import { T } from '@/lib/theme';
import type { UserRole } from '@/types/database';

type Role = 'artist' | 'organizer' | 'both';

const ROLES: { value: Role; title: string; subtitle: string }[] = [
  {
    value: 'organizer',
    title: 'Organize events',
    subtitle: 'I host events and need to book talent.',
  },
  {
    value: 'artist',
    title: 'Artist looking for work',
    subtitle: 'I perform at events — DJ, photographer, dancer, and more.',
  },
  {
    value: 'both',
    title: 'Looking for a party',
    subtitle: 'I perform and also attend or organize events.',
  },
];

export default function RoleSelect() {
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const selectRole = useSelectRole();
  const [selected, setSelected] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    if (!selected || !user) return;
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
        <View style={{ paddingTop: T.sp9, gap: T.sp3, alignItems: 'center' }}>
          <CJMark />
          <View style={{ alignItems: 'center', gap: T.sp2, paddingTop: T.sp3 }}>
            <Text variant="body">Welcome to Crackerjack</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text variant="display-s">What do you want to </Text>
              <Text variant="display-italic-s">do?</Text>
            </View>
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
            <Text variant="caption" color="#FF6B6B" style={{ textAlign: 'center' }}>
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
