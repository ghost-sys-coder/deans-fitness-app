import { type UserProfile } from '@/source/features/profiles/types/profileTypes';

export type AuthRedirectPath =
  | '/client'
  | '/home'
  | '/nutritionist'
  | '/trainer';

const onboardingRoutes = {
  admin: '/home',
  client: '/client',
  nutritionist: '/nutritionist',
  trainer: '/trainer',
} as const satisfies Record<UserProfile['role'], AuthRedirectPath>;

export function getAuthenticatedRedirectPath(profile: UserProfile): AuthRedirectPath {
  if (!profile.onboardingCompleted) {
    return onboardingRoutes[profile.role];
  }

  return '/home';
}
