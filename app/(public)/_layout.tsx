import { Redirect, Stack, type Href } from 'expo-router';

import { LoadingState } from '@/source/shared/ui/LoadingState';
import { useAuthSession } from '@/source/features/auth/hooks/useAuthSession';
import { useCurrentProfile } from '@/source/features/profiles/hooks/useCurrentProfile';
import { getAuthenticatedRedirectPath } from '@/source/core/navigation/authRedirects';

export default function PublicLayout() {
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const { data: profile, isLoading: isProfileLoading } = useCurrentProfile();

  if (isSessionLoading || (session && isProfileLoading)) {
    return <LoadingState message="Checking your session..." />;
  }

  if (session && profile) {
    return <Redirect href={getAuthenticatedRedirectPath(profile) as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
