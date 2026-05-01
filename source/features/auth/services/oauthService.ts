import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';
import { type OAuthProvider } from '../types/authTypes';

WebBrowser.maybeCompleteAuthSession();

export const authCallbackUrl = makeRedirectUri({
  scheme: 'deansfitness',
  path: 'auth-callback',
});

export async function signInWithOAuthProvider(provider: OAuthProvider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authCallbackUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('OAuth provider did not return a sign-in URL.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, authCallbackUrl);

  if (result.type === 'success') {
    await completeOAuthSessionFromUrl(result.url);
  }
}

export async function completeOAuthSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return data.session;
}
