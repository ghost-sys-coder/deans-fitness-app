import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text as NativeText, View } from 'react-native';

import { useTheme } from '@/source/shared/theme/ThemeProvider';
import { type OAuthProvider } from '../types/authTypes';

type OAuthButtonProps = {
  isLoading: boolean;
  label: string;
  onPress: () => void;
  provider: OAuthProvider;
};

export function OAuthButton({ isLoading, label, onPress, provider }: OAuthButtonProps) {
  const { tokens } = useTheme();
  const iconName = provider === 'apple' ? 'apple' : 'google';

  function handlePress() {
    void Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={isLoading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: tokens.colors.surface,
          borderColor: tokens.colors.border,
          borderRadius: tokens.radii.md,
          opacity: pressed || isLoading ? tokens.opacity.pressed : 1,
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={tokens.colors.text} />
      ) : (
        <View style={[styles.content, { gap: tokens.spacing.sm }]}>
          <FontAwesome color={tokens.colors.text} name={iconName} size={20} />
          <NativeText
            style={[
              styles.label,
              {
                color: tokens.colors.text,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
              },
            ]}
          >
            {label}
          </NativeText>
        </View>
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
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
