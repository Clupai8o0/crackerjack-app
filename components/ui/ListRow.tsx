import { Pressable, type PressableProps, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { T } from '@/lib/theme';
import Avatar from './Avatar';
import Text from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ListRowProps = PressableProps & {
  title: string;
  subtitle?: string;
  avatarUri?: string | null;
  avatarName?: string | null;
  trailing?: React.ReactNode;
  showChevron?: boolean;
};

export default function ListRow({
  title,
  subtitle,
  avatarUri,
  avatarName,
  trailing,
  showChevron = true,
  onPress,
  style,
  ...props
}: ListRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: T.surface,
          borderWidth: 1,
          borderColor: T.line,
          borderRadius: T.rPill,
          paddingVertical: 10,
          paddingLeft: 10,
          paddingRight: 14,
          gap: T.sp2,
        },
        style as object,
      ]}
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 120 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
      accessibilityRole="button"
      {...props}
    >
      <Avatar uri={avatarUri} name={avatarName} size="md" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body-strong">{title}</Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {trailing}
      {showChevron && (
        <Text variant="caption" color={T.ink3}>
          ›
        </Text>
      )}
    </AnimatedPressable>
  );
}
