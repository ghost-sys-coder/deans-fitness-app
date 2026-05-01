import { supabase } from '@/lib/supabase';
import { type ProfileRow, type UserProfile } from '../types/profileTypes';

const profileSelect = `
  id,
  email,
  role,
  status,
  full_name,
  avatar_path,
  onboarding_completed,
  created_at,
  updated_at
`;

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    avatarPath: row.avatar_path,
    createdAt: row.created_at,
    email: row.email,
    fullName: row.full_name,
    id: row.id,
    onboardingCompleted: row.onboarding_completed,
    role: row.role,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return mapProfileRow(data);
  }

  return createClientProfileForUser(user.id, user.email ?? null);
}

async function createClientProfileForUser(userId: string, email: string | null): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      email,
      id: userId,
      role: 'client',
    })
    .select(profileSelect)
    .single<ProfileRow>();

  if (error) {
    throw error;
  }

  return mapProfileRow(data);
}
