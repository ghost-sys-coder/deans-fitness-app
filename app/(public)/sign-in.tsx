import { Link, type Href } from 'expo-router';

import { AuthErrorMessage } from '@/source/features/auth/components/AuthErrorMessage';
import { AuthScreen } from '@/source/features/auth/components/AuthScreen';
import { EmailPasswordForm } from '@/source/features/auth/components/EmailPasswordForm';
import { OAuthButton } from '@/source/features/auth/components/OAuthButton';
import { useOAuthSignIn } from '@/source/features/auth/hooks/useOAuthSignIn';
import { useSignIn } from '@/source/features/auth/hooks/useSignIn';
import { Text } from '@/source/shared/ui/Text';

export default function SignInScreen() {
  const signIn = useSignIn();
  const oauthSignIn = useOAuthSignIn();

  return (
    <AuthScreen>
      <Text variant="title">Welcome back</Text>
      <Text variant="body">Sign in to continue your fitness and nutrition plan.</Text>
      <AuthErrorMessage message={signIn.errorMessage ?? oauthSignIn.errorMessage} />
      <EmailPasswordForm
        isLoading={signIn.isLoading}
        mode="sign-in"
        onSubmit={signIn.signIn}
        submitLabel="Sign in"
      />
      <OAuthButton
        isLoading={oauthSignIn.isLoading}
        label="Continue with Google"
        onPress={() => oauthSignIn.signInWithProvider('google')}
        provider="google"
      />
      <OAuthButton
        isLoading={oauthSignIn.isLoading}
        label="Continue with Apple"
        onPress={() => oauthSignIn.signInWithProvider('apple')}
        provider="apple"
      />
      <Link href={'/forgot-password' as Href}>
        <Text variant="link">Forgot password?</Text>
      </Link>
      <Link href={'/sign-up' as Href}>
        <Text variant="link">Create an account</Text>
      </Link>
    </AuthScreen>
  );
}
