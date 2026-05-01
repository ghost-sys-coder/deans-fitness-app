import { useState } from 'react';

import { signInWithOAuthProvider } from '../services/oauthService';
import { type OAuthProvider } from '../types/authTypes';
import { getAuthErrorMessage } from '../utils/authErrors';

export function useOAuthSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithProvider(provider: OAuthProvider) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithOAuthProvider(provider);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    errorMessage,
    isLoading,
    signInWithProvider,
  };
}
