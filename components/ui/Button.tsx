import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { T } from '@/lib/theme';
import Text from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  label,
  loading = false,
  fullWidth = true,
  disabled,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        {
          backgroundColor: T.ink,
          height: T.buttonHeight,
          borderRadius: T.rPill,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          opacity: disabled || loading ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? undefined : 'flex-start',
        },
        style as object,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      accessibilityRole="button"
      {...props}
    >
      <Text variant="label" color={T.inkDeep}>
        {loading ? 'Loading…' : label}
      </Text>
    </AnimatedPressable>
  );
}
