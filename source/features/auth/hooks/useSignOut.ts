import { useState } from 'react';

import { signOutCurrentUser } from '../services/authService';
import { getAuthErrorMessage } from '../utils/authErrors';

export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signOut() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signOutCurrentUser();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    errorMessage,
    isLoading,
    signOut,
  };
}
