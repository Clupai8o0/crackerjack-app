import { Stack } from 'expo-router';
import { T } from '@/lib/theme';

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
        animation: 'fade',
        gestureEnabled: false,
      }}
    />
  );
}
