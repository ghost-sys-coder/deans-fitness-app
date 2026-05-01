import { Link, type Href } from 'expo-router';

import { AuthErrorMessage } from '@/source/features/auth/components/AuthErrorMessage';
import { AuthScreen } from '@/source/features/auth/components/AuthScreen';
import { EmailPasswordForm } from '@/source/features/auth/components/EmailPasswordForm';
import { OAuthButton } from '@/source/features/auth/components/OAuthButton';
import { useOAuthSignIn } from '@/source/features/auth/hooks/useOAuthSignIn';
import { useSignUp } from '@/source/features/auth/hooks/useSignUp';
import { Text } from '@/source/shared/ui/Text';

export default function SignUpScreen() {
  const signUp = useSignUp();
  const oauthSignIn = useOAuthSignIn();

  return (
    <AuthScreen>
      <Text variant="title">Create your account</Text>
      <Text variant="body">Start with secure auth, then complete onboarding.</Text>
      <AuthErrorMessage message={signUp.errorMessage ?? oauthSignIn.errorMessage} />
      {signUp.successMessage ? <Text variant="success">{signUp.successMessage}</Text> : null}
      <EmailPasswordForm
        isLoading={signUp.isLoading}
        mode="sign-up"
        onSubmit={signUp.signUp}
        submitLabel="Create account"
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
      <Link href={'/sign-in' as Href}>
        <Text variant="link">Already have an account?</Text>
      </Link>
    </AuthScreen>
  );
}
