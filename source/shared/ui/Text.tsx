import { StyleSheet, Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

import { useTheme } from '@/source/shared/theme/ThemeProvider';

type TextVariant = 'body' | 'caption' | 'danger' | 'link' | 'success' | 'title';

type TextProps = NativeTextProps & {
  variant?: TextVariant;
};

export function Text({ style, variant = 'body', ...props }: TextProps) {
  const { tokens } = useTheme();
  const variantStyle = {
    body: {
      color: tokens.colors.text,
      fontSize: tokens.typography.fontSize.md,
      lineHeight: tokens.typography.lineHeight.md,
    },
    caption: {
      color: tokens.colors.textMuted,
      fontSize: tokens.typography.fontSize.sm,
      lineHeight: tokens.typography.lineHeight.sm,
    },
    danger: {
      color: tokens.colors.danger,
      fontSize: tokens.typography.fontSize.sm,
      lineHeight: tokens.typography.lineHeight.sm,
    },
    link: {
      color: tokens.colors.primary,
      fontSize: tokens.typography.fontSize.md,
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.md,
    },
    success: {
      color: tokens.colors.success,
      fontSize: tokens.typography.fontSize.sm,
      lineHeight: tokens.typography.lineHeight.sm,
    },
    title: {
      color: tokens.colors.text,
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight['2xl'],
    },
  } satisfies Record<TextVariant, object>;

  return <NativeText style={[styles.text, variantStyle[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  text: {
    flexShrink: 1,
  },
});
