import { useState } from 'react';

import { signInWithEmail } from '../services/authService';
import { type AuthCredentials } from '../types/authTypes';
import { getAuthErrorMessage } from '../utils/authErrors';

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signIn(credentials: AuthCredentials) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmail(credentials);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    errorMessage,
    isLoading,
    signIn,
  };
}
