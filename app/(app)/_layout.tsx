import { Tabs } from 'expo-router';
import { T } from '@/lib/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        sceneStyle: { backgroundColor: T.bg },
      }}
    />
  );
}
