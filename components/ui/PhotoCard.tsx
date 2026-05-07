import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View, type ViewProps } from 'react-native';
import { T } from '@/lib/theme';

type PhotoCardSize = 'hero' | 'tile' | 'footer';

type PhotoCardProps = ViewProps & {
  uri?: string | null;
  size: PhotoCardSize;
  children?: React.ReactNode;
};

const SIZE_STYLES = {
  hero: { height: 380, borderRadius: T.rHero },
  tile: { aspectRatio: 1 / 1.05, borderRadius: T.rCard },
  footer: { minHeight: 170, borderRadius: T.rTile },
} as const;

const SCRIM_COLORS = ['rgba(15,10,28,0)', 'rgba(15,10,28,0.85)'] as const;

export default function PhotoCard({ uri, size, children, style, ...props }: PhotoCardProps) {
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          backgroundColor: T.surface,
          ...sizeStyle,
        },
        style,
      ]}
      {...props}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={200}
        />
      ) : null}
      <LinearGradient
        colors={SCRIM_COLORS}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {children}
    </View>
  );
}
