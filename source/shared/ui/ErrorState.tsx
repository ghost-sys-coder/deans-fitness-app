import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/source/shared/theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

type ErrorStateProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
};

export function ErrorState({ actionLabel, message, onAction }: ErrorStateProps) {
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
      <Text variant="danger">{message}</Text>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'center',
  },
});
