import { Image } from 'expo-image';
import { View } from 'react-native';
import { T } from '@/lib/theme';
import Text from './Text';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
};

const SIZE_MAP = { sm: 32, md: 38, lg: 56 } as const;
const FONT_SIZE_MAP = { sm: 12, md: 14, lg: 20 } as const;

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: T.rPill,
        borderWidth: 1,
        borderColor: T.line,
        overflow: 'hidden',
        backgroundColor: T.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dimension, height: dimension }}
          contentFit="cover"
          transition={200}
        />
      ) : name ? (
        <Text variant="body-strong" style={{ fontSize, color: T.ink2 }}>
          {getInitials(name)}
        </Text>
      ) : (
        <View
          style={{ width: '60%', height: '60%', borderRadius: T.rPill, backgroundColor: T.line }}
        />
      )}
    </View>
  );
}
