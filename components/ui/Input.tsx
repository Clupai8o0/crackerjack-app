import { TextInput, type TextInputProps } from 'react-native';
import { T } from '@/lib/theme';

type InputProps = TextInputProps & {
  error?: boolean;
};

export default function Input({ error = false, style, ...props }: InputProps) {
  return (
    <TextInput
      style={[
        {
          height: T.buttonHeight,
          borderRadius: T.rPill,
          borderWidth: 1,
          borderColor: error ? T.accent : T.line,
          backgroundColor: T.surface,
          paddingHorizontal: T.sp7,
          fontFamily: T.sans,
          fontSize: 15,
          color: T.ink,
          width: '100%',
        },
        style,
      ]}
      placeholderTextColor={T.ink3}
      selectionColor={T.accent}
      cursorColor={T.accent}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
}
