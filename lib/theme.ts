export const T = {
  // surfaces
  bg: '#000000',
  surface: '#0E0E10',
  raised: '#16161A',
  line: '#26262C',
  // ink — pure white/black only, no colour tinge; secondary/tertiary via opacity
  ink: '#FFFFFF',
  ink2: 'rgba(255,255,255,0.55)',
  ink3: 'rgba(255,255,255,0.35)',
  inkDeep: '#000000',
  // accent
  accent: '#39FF7A',
  accentInk: '#08210F',
  accentSoftFill: 'rgba(57,255,122,0.12)',
  accentSoftBorder: 'rgba(57,255,122,0.35)',
  // type
  sans: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  // radius
  rPill: 999,
  rTile: 18,
  rCard: 22,
  rHero: 28,
  // spacing (base scale: 4/8/12/14/16/18/22/24/30)
  sp1: 4,
  sp2: 8,
  sp3: 12,
  sp4: 14,
  sp5: 16,
  sp6: 18,
  sp7: 22,
  sp8: 24,
  sp9: 30,
  // fixed heights
  tabBarSafeZone: 120,
  statusBarHeight: 44,
  buttonHeight: 54,
  pillHeight: 36,
  pillHeightMd: 28,
  pillHeightSm: 20,
  iconButtonSize: 42,
  iconButtonSizeSm: 36,
} as const;
