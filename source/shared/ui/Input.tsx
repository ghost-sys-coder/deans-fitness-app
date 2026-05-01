import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/source/shared/theme/ThemeProvider';
import { Text } from './Text';

type InputProps = TextInputProps & {
  errorMessage?: string;
  label: string;
};

export function Input({ errorMessage, label, style, ...props }: InputProps) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.field, { gap: tokens.spacing.xs }]}>
      <Text variant="caption">{label}</Text>
      <TextInput
        placeholderTextColor={tokens.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: tokens.colors.surface,
            borderColor: errorMessage ? tokens.colors.danger : tokens.colors.border,
            borderRadius: tokens.radii.md,
            color: tokens.colors.text,
            fontSize: tokens.typography.fontSize.md,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
          },
          style,
        ]}
        {...props}
      />
      {errorMessage ? <Text variant="danger">{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
  },
});
