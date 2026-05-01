import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text as NativeText } from 'react-native';

import { useTheme } from '@/source/shared/theme/ThemeProvider';

type ButtonProps = {
  isLoading?: boolean;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function Button({ isLoading = false, label, onPress, variant = 'primary' }: ButtonProps) {
  const { tokens } = useTheme();
  const isPrimary = variant === 'primary';

  function handlePress() {
    void Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isLoading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? tokens.colors.primary : tokens.colors.surface,
          borderColor: isPrimary ? tokens.colors.primary : tokens.colors.border,
          borderRadius: tokens.radii.md,
          opacity: pressed || isLoading ? tokens.opacity.pressed : 1,
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? tokens.colors.textInverse : tokens.colors.text} />
      ) : (
        <NativeText
          style={[
            styles.label,
            {
              color: isPrimary ? tokens.colors.textInverse : tokens.colors.text,
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
            },
          ]}
        >
          {label}
        </NativeText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
