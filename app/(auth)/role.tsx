import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Glow, Screen, Text } from '@/components/ui';
import { useSelectRole } from '@/features/auth/mutations';
import { useAuthStore } from '@/features/auth/store';
import { T } from '@/lib/theme';
import type { UserRole } from '@/types/database';

type Role = 'artist' | 'organizer' | 'both';

const ROLES: { value: Role; title: string; subtitle: string }[] = [
  {
    value: 'artist',
    title: 'Artist',
    subtitle: 'I perform at events — DJ, photographer, dancer, and more.',
  },
  { value: 'organizer', title: 'Organizer', subtitle: 'I host events and need to book talent.' },
  { value: 'both', title: 'Both', subtitle: 'I perform and also organize events.' },
];

export default function RoleSelect() {
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const selectRole = useSelectRole();
  const [selected, setSelected] = useState<Role | null>(null);

  async function onConfirm() {
    if (!selected || !user) return;
    await selectRole.mutateAsync({ userId: user.id, role: selected as UserRole });
    setRole(selected as UserRole);
  }

  return (
    <Screen>
      <Glow style={{ top: -40, left: '10%', opacity: 0.5 }} />

      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: T.sp9 }}>
        <View style={{ gap: T.sp2 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant="display-m">You are a </Text>
            <Text variant="display-italic-m">…?</Text>
          </View>
          <Text variant="body">Pick the role that fits. You can change this later.</Text>
        </View>

        <View style={{ gap: T.sp4 }}>
          {ROLES.map((role) => {
            const active = selected === role.value;
            return (
              <Pressable
                key={role.value}
                onPress={() => setSelected(role.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={{
                  borderRadius: T.rCard,
                  borderWidth: 1.5,
                  borderColor: active ? T.accent : T.line,
                  backgroundColor: active ? T.accentSoftFill : T.surface,
                  padding: T.sp6,
                  gap: T.sp2,
                }}
              >
                <Text variant="body-strong" color={active ? T.accent : T.ink}>
                  {role.title}
                </Text>
                <Text variant="body">{role.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          label="Continue"
          onPress={onConfirm}
          disabled={!selected}
          loading={selectRole.isPending}
        />
      </View>
    </Screen>
  );
}
