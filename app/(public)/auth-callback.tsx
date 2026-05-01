import { LoadingState } from '@/source/shared/ui/LoadingState';
import { useAuthCallback } from '@/source/features/auth/hooks/useAuthCallback';

export default function AuthCallbackScreen() {
  useAuthCallback();

  return <LoadingState message="Completing secure sign in..." />;
}
