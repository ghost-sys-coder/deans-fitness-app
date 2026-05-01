import { Link, type Href } from 'expo-router';

import { AuthErrorMessage } from '@/source/features/auth/components/AuthErrorMessage';
import { AuthScreen } from '@/source/features/auth/components/AuthScreen';
import { usePasswordReset } from '@/source/features/auth/hooks/usePasswordReset';
import { Button } from '@/source/shared/ui/Button';
import { Input } from '@/source/shared/ui/Input';
import { Text } from '@/source/shared/ui/Text';

export default function ForgotPasswordScreen() {
  const passwordReset = usePasswordReset();

  return (
    <AuthScreen>
      <Text variant="title">Reset password</Text>
      <Text variant="body">Enter your email and we will send a secure reset link.</Text>
      <AuthErrorMessage message={passwordReset.errorMessage} />
      {passwordReset.successMessage ? (
        <Text variant="success">{passwordReset.successMessage}</Text>
      ) : null}
      <Input
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="Email"
        onChangeText={passwordReset.setEmail}
        placeholder="you@example.com"
        value={passwordReset.email}
      />
      <Button
        isLoading={passwordReset.isLoading}
        label="Send reset link"
        onPress={passwordReset.sendResetLink}
      />
      <Link href={'/sign-in' as Href}>
        <Text variant="link">Back to sign in</Text>
      </Link>
    </AuthScreen>
  );
}
