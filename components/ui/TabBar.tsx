import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/lib/theme';

type TabItem = {
  key: string;
  icon: (active: boolean) => React.ReactNode;
  label: string;
};

type TabBarProps = {
  tabs: TabItem[];
  activeKey: string;
  onPress: (key: string) => void;
};

export default function TabBar({ tabs, activeKey, onPress }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: Math.max(insets.bottom, 20),
        left: 0,
        right: 0,
        alignItems: 'center',
        pointerEvents: 'box-none',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: T.raised,
          borderRadius: T.rPill,
          borderWidth: 1,
          borderColor: T.line,
          padding: 6,
          gap: 4,
        }}
      >
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onPress(tab.key)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              style={{
                width: 50,
                height: 50,
                borderRadius: T.rPill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? T.ink : 'transparent',
              }}
            >
              {tab.icon(active)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
