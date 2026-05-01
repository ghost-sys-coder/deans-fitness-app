import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from '@/source/features/auth/hooks/useAuthSession';
import { getCurrentProfile } from '../services/profileService';

export function useCurrentProfile() {
  const { session } = useAuthSession();

  return useQuery({
    enabled: Boolean(session),
    queryFn: getCurrentProfile,
    queryKey: ['current-profile', session?.user.id],
  });
}
