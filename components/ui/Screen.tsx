import { ScrollView, type ScrollViewProps, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '@/lib/theme';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewProps['style'];
  scrollViewProps?: ScrollViewProps;
};

export default function Screen({ children, scroll = false, style, scrollViewProps }: ScreenProps) {
  const content = (
    <View
      style={[
        {
          flex: scroll ? undefined : 1,
          paddingHorizontal: T.sp7,
          paddingBottom: T.tabBarSafeZone,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
