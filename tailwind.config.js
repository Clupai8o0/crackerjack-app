/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#0E0E10',
        raised: '#16161A',
        line: '#26262C',
        ink: '#F5F1EB',
        ink2: '#C9C1D5',
        ink3: '#7A7A82',
        'ink-deep': '#1A0F33',
        accent: '#39FF7A',
        'accent-ink': '#08210F',
      },
      borderRadius: {
        pill: 999,
        tile: 18,
        card: 22,
        hero: 28,
      },
      fontFamily: {
        sans: ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        mono: ['JetBrainsMono_500Medium'],
        serif: ['InstrumentSerif_400Regular'],
        'serif-italic': ['InstrumentSerif_400Regular_Italic'],
      },
      spacing: {
        4.5: '18px',
        5.5: '22px',
        7.5: '30px',
      },
    },
  },
  plugins: [],
};
