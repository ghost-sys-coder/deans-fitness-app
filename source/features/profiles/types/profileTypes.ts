export type UserRole = 'admin' | 'client' | 'nutritionist' | 'trainer';

export type ProfileStatus = 'active' | 'suspended';

export type UserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
  status: ProfileStatus;
  fullName: string | null;
  avatarPath: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  role: UserRole;
  status: ProfileStatus;
  full_name: string | null;
  avatar_path: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};
