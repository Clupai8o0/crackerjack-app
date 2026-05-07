import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { T } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconButtonContext = 'surface' | 'photo';
type IconButtonSize = 'md' | 'sm';

type IconButtonProps = PressableProps & {
  icon: React.ReactNode;
  context?: IconButtonContext;
  size?: IconButtonSize;
};

const CONTEXT_STYLES = {
  surface: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  photo: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
} as const;

export default function IconButton({
  icon,
  context = 'surface',
  size = 'md',
  onPress,
  style,
  ...props
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const dimension = size === 'md' ? T.iconButtonSize : T.iconButtonSizeSm;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        {
          ...CONTEXT_STYLES[context],
          width: dimension,
          height: dimension,
          borderRadius: T.rPill,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style as object,
      ]}
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 120 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
      hitSlop={8}
      accessibilityRole="button"
      {...props}
    >
      {icon}
    </AnimatedPressable>
  );
}
