import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MeshGradientView } from 'expo-mesh-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { T } from '@/lib/theme';

const { width: W } = Dimensions.get('window');
const HERO_FIGURE = Math.round(W * 0.92);
const MESH_OPACITY = 0.55; // bg shows through equally — tweak to taste
const CARD_RADIUS = 36;

// ─── Mesh gradient configs (3×3 = 9 control points) ──────────────────────────
// Each config is a dark green base (≈ T.bg) with TWO bright neon points so
// the mesh reads as two glowing blobs floating over the page background
// rather than a full color wash. Wrapped in MESH_OPACITY so T.bg shows
// through equally, keeping the mesh and bg balanced.

type MeshConfig = { colors: string[] };

const D = '#06180C'; // near-T.bg dark green — the "rest is bg" color

const MESH_CONFIGS: MeshConfig[] = [
  {
    // ARTISTS — blob top-right, blob bottom-left
    //         TL  TC  TR  ML  MC  MR  BL  BC  BR
    colors: [D, D, '#7BFFAE', D, D, D, '#3BFFB8', D, D],
  },
  {
    // PAYMENTS — blob top-left, blob bottom-right
    colors: ['#86FFD4', D, D, D, D, D, D, D, '#7BFFAE'],
  },
  {
    // CRACKING — blob top-center (lime), blob middle-right (mint)
    colors: [D, '#C8FF82', D, D, D, '#3BFFB8', D, D, D],
  },
];

// Slightly perturbed 3×3 uniform grid for organic feel
const MESH_POINTS: number[][] = [
  [0.0, 0.0],
  [0.5, 0.0],
  [1.0, 0.0],
  [0.0, 0.5],
  [0.5, 0.5],
  [1.0, 0.5],
  [0.0, 1.0],
  [0.5, 1.0],
  [1.0, 1.0],
];

// ─── Slide data ───────────────────────────────────────────────────────────────

type WelcomeSlide = {
  id: string;
  type: 'welcome';
  headline: string;
  body: string;
  cta: string;
};
type HeroSlide = {
  id: string;
  type: 'hero';
  image: number;
  headline: string;
  body: string;
  cta: string;
};
type Slide = WelcomeSlide | HeroSlide;

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    type: 'welcome',
    headline: 'Welcome to Crackerjack!',
    body: 'The ultimate solution for all your Artists and event needs.',
    cta: 'Next',
  },
  {
    id: 'book',
    type: 'hero',
    image: require('@/assets/images/onboarding-hero-1.png'),
    headline: 'Create a cracking event by booking your favorite Artists',
    body: '',
    cta: 'Next',
  },
  {
    id: 'payments',
    type: 'hero',
    image: require('@/assets/images/onboarding-hero-2.png'),
    headline: 'Secured payments for Artists, Venues and Production',
    body: '',
    cta: 'Next',
  },
  {
    id: 'start',
    type: 'hero',
    image: require('@/assets/images/onboarding-hero-3.png'),
    headline: "Let's get Cracking",
    body: '',
    cta: 'Get Started',
  },
];

const HERO_SLIDES = SLIDES.filter((s) => s.type === 'hero');

// ─── Sub-components ──────────────────────────────────────────────────────────

function PaginationDot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 28 : 8);

  useEffect(() => {
    width.value = withTiming(active ? 28 : 8, { duration: 220 });
  }, [active, width]);

  const animStyle = useAnimatedStyle(() => ({ width: width.value }));

  if (!active) {
    return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.ink3 }} />;
  }

  return (
    <Animated.View style={[animStyle, { height: 8, borderRadius: 4, overflow: 'hidden' }]}>
      <LinearGradient
        colors={['#3BFFB8', '#C8FF82']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

function GradientButton({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 120 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        style={{
          height: 56,
          borderRadius: 999,
          overflow: 'hidden',
        }}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#3BFFB8', '#7BFFAE', '#C8FF82']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="label" color={T.inkDeep}>
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function SlideHeadline({ text, isActive }: { text: string; isActive: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 380 });
      translateY.value = withTiming(0, { duration: 380 });
    } else {
      opacity.value = 0;
      translateY.value = 18;
    }
  }, [isActive, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Text variant="display-s" style={{ textAlign: 'center' }}>
        {text}
      </Text>
    </Animated.View>
  );
}

// ─── Slide wrappers ──────────────────────────────────────────────────────────

function WelcomeSlideView({
  slide,
  isActive,
  onPressCTA,
  bottomInset,
}: {
  slide: WelcomeSlide;
  isActive: boolean;
  onPressCTA: () => void;
  bottomInset: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 380 });
      translateY.value = withTiming(0, { duration: 380 });
    } else {
      opacity.value = 0;
      translateY.value = 18;
    }
  }, [isActive, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={{ width: W, flex: 1, backgroundColor: T.bg }}>
      <Image
        source={require('@/assets/images/onboarding-welcome-bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(26,80,45,0.55)', 'rgba(8,28,14,0.92)', T.bg, T.bg]}
        locations={[0, 0.28, 0.5, 0.67, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9 + bottomInset,
          gap: T.sp6,
        }}
      >
        <Image
          source={require('@/assets/images/crackerjack-logo.png')}
          style={{ width: 110, height: 110 }}
          contentFit="contain"
        />
        <Animated.View style={[animStyle, { gap: T.sp3 }]}>
          <Text variant="display-s" style={{ textAlign: 'left' }}>
            {slide.headline}
          </Text>
          {slide.body ? (
            <Text variant="body" style={{ textAlign: 'left' }}>
              {slide.body}
            </Text>
          ) : null}
        </Animated.View>
        <GradientButton label={slide.cta} onPress={onPressCTA} />
      </View>
    </View>
  );
}

function HeroSlideView({
  slide,
  isActive,
  heroIndex,
  ctaLabel,
  onPressCTA,
  bottomInset,
}: {
  slide: HeroSlide;
  isActive: boolean;
  heroIndex: number;
  ctaLabel: string;
  onPressCTA: () => void;
  bottomInset: number;
}) {
  // biome-ignore lint/style/noNonNullAssertion: heroIndex is always 0–2
  const config = MESH_CONFIGS[heroIndex]!;

  return (
    <View style={{ width: W, flex: 1, backgroundColor: T.bg }}>
      {/* ── Two-blob mesh — reduced opacity so T.bg shows through ─────── */}
      <View style={[StyleSheet.absoluteFill, { opacity: MESH_OPACITY }]} pointerEvents="none">
        <MeshGradientView
          style={StyleSheet.absoluteFill}
          columns={3}
          rows={3}
          colors={config.colors}
          points={MESH_POINTS}
          smoothsColors
          resolution={{ x: 8, y: 8 }}
        />
      </View>

      {/* ── Hero figure (image already contains disc + dots + black bg) ── */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={slide.image}
          style={{ width: HERO_FIGURE, height: HERO_FIGURE }}
          contentFit="contain"
        />
      </View>

      {/* ── Bottom card — solid T.bg, contains headline + dots + CTA ──── */}
      <View
        style={{
          backgroundColor: T.bg,
          borderTopLeftRadius: CARD_RADIUS,
          borderTopRightRadius: CARD_RADIUS,
          paddingHorizontal: T.sp7,
          paddingTop: T.sp8,
          paddingBottom: T.sp9 + bottomInset,
          gap: T.sp6,
          alignItems: 'center',
        }}
      >
        <SlideHeadline text={slide.headline} isActive={isActive} />
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {HERO_SLIDES.map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable fixed-length pagination dots
            <PaginationDot key={i} active={i === heroIndex} />
          ))}
        </View>
        <GradientButton label={ctaLabel} onPress={onPressCTA} />
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / W);
    setCurrentIndex(newIndex);
  }, []);

  function handleComplete() {
    router.replace('/(auth)/welcome');
  }

  function goNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= SLIDES.length) {
      handleComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  }

  function goBack() {
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) return;
    listRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    setCurrentIndex(prevIndex);
  }

  const isHeroSlide = currentIndex > 0;
  const isLastSlide = currentIndex === SLIDES.length - 1;
  const onPressCTA = isLastSlide ? handleComplete : goNext;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      {isHeroSlide && (
        <Pressable
          onPress={goBack}
          hitSlop={12}
          style={{ position: 'absolute', top: 56, left: T.sp7, zIndex: 10 }}
        >
          <Text variant="body-strong" color={T.ink3} style={{ fontSize: 22 }}>
            {'‹'}
          </Text>
        </Pressable>
      )}

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        scrollEnabled={false}
        onMomentumScrollEnd={handleScrollEnd}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isActive = index === currentIndex;
          if (item.type === 'welcome') {
            return (
              <WelcomeSlideView
                slide={item}
                isActive={isActive}
                onPressCTA={onPressCTA}
                bottomInset={insets.bottom}
              />
            );
          }
          return (
            <HeroSlideView
              slide={item}
              isActive={isActive}
              heroIndex={index - 1}
              ctaLabel={item.cta}
              onPressCTA={onPressCTA}
              bottomInset={insets.bottom}
            />
          );
        }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}
