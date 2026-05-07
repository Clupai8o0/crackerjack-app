import { View, type ViewProps } from 'react-native';
import { T } from '@/lib/theme';
import Text from './Text';

type PillFlavor = 'accent' | 'cream' | 'ghost' | 'tinted';
type PillSize = 'lg' | 'md' | 'sm';

type PillProps = ViewProps & {
  label: string;
  flavor?: PillFlavor;
  size?: PillSize;
};

const FLAVOR_STYLES = {
  accent: { bg: T.accent, border: undefined, textColor: T.accentInk },
  cream: { bg: T.ink, border: undefined, textColor: T.inkDeep },
  ghost: {
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.10)',
    textColor: T.ink2,
  },
  tinted: {
    bg: T.accentSoftFill,
    border: T.accentSoftBorder,
    textColor: T.accent,
  },
} as const;

const SIZE_STYLES = {
  lg: { height: T.pillHeight, paddingHorizontal: 14 },
  md: { height: T.pillHeightMd, paddingHorizontal: 11 },
  sm: { height: T.pillHeightSm, paddingHorizontal: 9, paddingVertical: 3 },
} as const;

export default function Pill({ label, flavor = 'ghost', size = 'lg', style, ...props }: PillProps) {
  const f = FLAVOR_STYLES[flavor];
  const s = SIZE_STYLES[size];

  return (
    <View
      style={[
        {
          backgroundColor: f.bg,
          borderWidth: f.border ? 1 : 0,
          borderColor: f.border,
          borderRadius: T.rPill,
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
        },
        style,
      ]}
      {...props}
    >
      <Text variant="pill" color={f.textColor}>
        {label}
      </Text>
    </View>
  );
}
