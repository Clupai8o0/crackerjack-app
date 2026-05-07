import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { T } from '@/lib/theme';

type TextVariant =
  | 'display-l'
  | 'display-m'
  | 'display-s'
  | 'display-italic-l'
  | 'display-italic-m'
  | 'display-italic-s'
  | 'body'
  | 'body-strong'
  | 'label'
  | 'pill'
  | 'caption'
  | 'mono-eyebrow'
  | 'mono-time'
  | 'mono-unit'
  | 'tile-name'
  | 'tile-category';

type TextProps = RNTextProps & {
  variant: TextVariant;
  color?: string;
};

const VARIANT_STYLES: Record<TextVariant, object> = {
  'display-l': { fontFamily: T.serif, fontSize: 48, lineHeight: 48, color: T.ink },
  'display-m': { fontFamily: T.serif, fontSize: 38, lineHeight: 40, color: T.ink },
  'display-s': { fontFamily: T.serif, fontSize: 30, lineHeight: 31, color: T.ink },
  'display-italic-l': {
    fontFamily: T.serifItalic,
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -0.48,
    color: T.accent,
  },
  'display-italic-m': {
    fontFamily: T.serifItalic,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.38,
    color: T.accent,
  },
  'display-italic-s': {
    fontFamily: T.serifItalic,
    fontSize: 30,
    lineHeight: 31,
    letterSpacing: -0.3,
    color: T.accent,
  },
  body: { fontFamily: T.sans, fontSize: 13.5, lineHeight: 20, color: T.ink2 },
  'body-strong': { fontFamily: T.sansSemiBold, fontSize: 13.5, lineHeight: 20, color: T.ink },
  label: { fontFamily: T.sansSemiBold, fontSize: 15, letterSpacing: -0.075, color: T.ink },
  pill: { fontFamily: T.sansSemiBold, fontSize: 12.5, letterSpacing: -0.0625, color: T.ink },
  caption: { fontFamily: T.sans, fontSize: 11, lineHeight: 16, color: T.ink3 },
  'mono-eyebrow': {
    fontFamily: T.mono,
    fontSize: 9.5,
    letterSpacing: 1.33,
    textTransform: 'uppercase',
    color: T.ink3,
  },
  'mono-time': { fontFamily: T.mono, fontSize: 10.5, letterSpacing: 0.42, color: T.ink2 },
  'mono-unit': { fontFamily: T.mono, fontSize: 11, color: T.ink3 },
  'tile-name': {
    fontFamily: T.sansSemiBold,
    fontSize: 13,
    letterSpacing: -0.13,
    color: T.ink,
  },
  'tile-category': {
    fontFamily: T.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 0.19,
    color: T.ink,
  },
};

export default function Text({ variant, color, style, ...props }: TextProps) {
  return <RNText style={[VARIANT_STYLES[variant], color ? { color } : null, style]} {...props} />;
}
