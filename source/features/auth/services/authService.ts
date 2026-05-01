import { type Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { type AuthCredentials } from '../types/authTypes';

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function subscribeToAuthChanges(onSessionChange: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onSessionChange(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(credentials: AuthCredentials) {
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    throw error;
  }
}

export async function signUpWithEmail(credentials: AuthCredentials) {
  const { error } = await supabase.auth.signUp(credentials);

  if (error) {
    throw error;
  }
}

export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }
}
