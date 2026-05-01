import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/source/shared/theme/ThemeProvider';
import { Text } from './Text';

type LoadingStateProps = {
  message: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  const { tokens } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.colors.background,
          gap: tokens.spacing.md,
          padding: tokens.spacing.xl,
        },
      ]}
    >
      <ActivityIndicator color={tokens.colors.primary} />
      <Text variant="body">{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
