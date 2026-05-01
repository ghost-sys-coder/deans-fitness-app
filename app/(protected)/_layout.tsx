import { Redirect, Stack, type Href } from 'expo-router';

import { getAuthenticatedRedirectPath } from '@/source/core/navigation/authRedirects';
import { useAuthSession } from '@/source/features/auth/hooks/useAuthSession';
import { useCurrentProfile } from '@/source/features/profiles/hooks/useCurrentProfile';
import { ErrorState } from '@/source/shared/ui/ErrorState';
import { LoadingState } from '@/source/shared/ui/LoadingState';

export default function ProtectedLayout() {
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const { data: profile, error, isLoading: isProfileLoading, refetch } = useCurrentProfile();

  if (isSessionLoading || (session && isProfileLoading)) {
    return <LoadingState message="Loading your account..." />;
  }

  if (!session) {
    return <Redirect href={'/sign-in' as Href} />;
  }

  if (error || !profile) {
    return (
      <ErrorState
        actionLabel="Try again"
        message="We could not load your profile."
        onAction={() => void refetch()}
      />
    );
  }

  const redirectPath = getAuthenticatedRedirectPath(profile);

  if (redirectPath !== '/home') {
    return <Redirect href={redirectPath as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
