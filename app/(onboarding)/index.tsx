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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { T } from '@/lib/theme';

const { width: W, height: H } = Dimensions.get('window');
const HERO_SIZE = Math.round(W * 0.74);

// ─── Mesh gradient configs (3×3 = 9 control points) ──────────────────────────
// All non-accent points use dark tinted greens (not pure black) so the whole
// screen has a consistent green wash — brighter at accent points, dim elsewhere.

type MeshConfig = { colors: string[] };

const MESH_CONFIGS: MeshConfig[] = [
  {
    // ARTISTS — neon burst top-center, lime top-right, mint bottom-left
    colors: [
      '#0C2010',
      '#39FF7A',
      '#1A3818',
      '#96FF3E',
      '#0E2412',
      '#0C1E10',
      '#3BFFB8',
      '#0A1A0C',
      '#081408',
    ],
  },
  {
    // PAYMENTS — mint top-left, neon top-right, lime bottom-center
    colors: [
      '#3BFFB8',
      '#122C1C',
      '#39FF7A',
      '#0C2016',
      '#1A3820',
      '#0E2418',
      '#0A1610',
      '#96FF3E',
      '#0C1A10',
    ],
  },
  {
    // CRACKING — yellow-green top-left, neon right, mint bottom-right
    colors: [
      '#C4FF3E',
      '#1A2C08',
      '#0A1808',
      '#162408',
      '#39FF7A',
      '#1A3014',
      '#0A1208',
      '#1A2C10',
      '#3BFFB8',
    ],
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
  const width = useSharedValue(active ? 24 : 8);

  useEffect(() => {
    width.value = withTiming(active ? 24 : 8, { duration: 220 });
  }, [active, width]);

  const animStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: active ? T.accent : T.ink3,
        },
      ]}
    />
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

function WelcomeSlideView({ slide, isActive }: { slide: WelcomeSlide; isActive: boolean }) {
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
    <View style={{ width: W, flex: 1 }}>
      <Image
        source={require('@/assets/images/onboarding-welcome-bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(26,80,45,0.55)', 'rgba(8,28,14,0.92)', '#060F08']}
        locations={[0, 0.28, 0.56, 0.72]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp7,
        }}
      >
        <Image
          source={require('@/assets/images/crackerjack-logo.png')}
          style={{ width: 110, height: 110, marginBottom: T.sp5 }}
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
      </View>
    </View>
  );
}

function HeroSlideView({
  slide,
  isActive,
  heroIndex,
}: {
  slide: HeroSlide;
  isActive: boolean;
  heroIndex: number;
}) {
  // biome-ignore lint/style/noNonNullAssertion: heroIndex is always 0–2
  const config = MESH_CONFIGS[heroIndex]!;

  return (
    <View style={{ width: W, height: H, backgroundColor: T.bg }}>
      {/* ── Mesh gradient — fills entire slide ────────────────────────── */}
      <MeshGradientView
        style={StyleSheet.absoluteFill}
        columns={3}
        rows={3}
        colors={config.colors}
        points={MESH_POINTS}
        smoothsColors
        resolution={{ x: 8, y: 8 }}
      />

      {/* ── Subtle dark vignette at bottom for text readability ────────── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
        locations={[0.45, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Hero photo ────────────────────────────────────────────────── */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: HERO_SIZE,
            height: HERO_SIZE,
            borderRadius: HERO_SIZE / 2,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: `${T.accent}50`,
          }}
        >
          <Image
            source={slide.image}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        </View>
      </View>

      {/* ── Headline + pagination ──────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: T.sp7,
          paddingBottom: T.sp9,
          gap: T.sp5,
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
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
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

  // biome-ignore lint/style/noNonNullAssertion: invariant
  const currentSlide = SLIDES[currentIndex]!;
  const isLastSlide = currentIndex === SLIDES.length - 1;
  const isHeroSlide = currentIndex > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
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
            return <WelcomeSlideView slide={item} isActive={isActive} />;
          }
          return <HeroSlideView slide={item} isActive={isActive} heroIndex={index - 1} />;
        }}
        style={{ flex: 1 }}
      />

      <View style={{ paddingHorizontal: T.sp7, paddingBottom: T.sp9 }}>
        <Button label={currentSlide.cta} onPress={isLastSlide ? handleComplete : goNext} />
      </View>
    </SafeAreaView>
  );
}
