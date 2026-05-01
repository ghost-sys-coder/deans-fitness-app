import { Text } from '@/source/shared/ui/Text';

type AuthErrorMessageProps = {
  message?: string | null;
};

export function AuthErrorMessage({ message }: AuthErrorMessageProps) {
  if (!message) {
    return null;
  }

  return <Text variant="danger">{message}</Text>;
}
