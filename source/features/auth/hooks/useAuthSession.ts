import { useAuthContext } from '@/source/core/providers/AuthProvider';

export function useAuthSession() {
  return useAuthContext();
}
