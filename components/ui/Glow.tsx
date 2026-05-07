import { View, type ViewProps } from 'react-native';

type GlowProps = ViewProps & {
  size?: number;
};

export default function Glow({ size = 300, style, ...props }: GlowProps) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(57,255,122,0.24)',
          // Blur effect via shadow — expo-blur would be ideal for production
          shadowColor: '#39FF7A',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.24,
          shadowRadius: 50,
          pointerEvents: 'none',
        },
        style,
      ]}
      {...props}
    />
  );
}
