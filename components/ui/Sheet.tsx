import { useEffect } from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/lib/theme';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Sheet({ visible, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(400);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 220 });
    } else {
      translateY.value = withTiming(400, { duration: 220 });
    }
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose} />
      <Animated.View
        style={[
          animatedStyle,
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: T.raised,
            borderTopLeftRadius: T.rHero,
            borderTopRightRadius: T.rHero,
            paddingTop: T.sp6,
            paddingBottom: insets.bottom + T.sp8,
            paddingHorizontal: T.sp7,
          },
        ]}
      >
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: T.rPill,
            backgroundColor: T.line,
            alignSelf: 'center',
            marginBottom: T.sp6,
          }}
        />
        {children}
      </Animated.View>
    </Modal>
  );
}
