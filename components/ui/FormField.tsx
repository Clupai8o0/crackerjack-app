import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { type TextInputProps, View } from 'react-native';
import { T } from '@/lib/theme';
import Input from './Input';
import Text from './Text';

type FormFieldProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  inputProps?: TextInputProps;
};

export default function FormField<TValues extends FieldValues>({
  control,
  name,
  label,
  inputProps,
}: FormFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={{ gap: T.sp2 }}>
          <Text variant="mono-eyebrow">{label}</Text>
          <Input
            value={value as string}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            {...inputProps}
          />
          {error?.message ? (
            <Text variant="caption" color={T.accent}>
              {error.message}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}
