import { useState } from 'react';

import { signUpWithEmail } from '../services/authService';
import { type AuthCredentials } from '../types/authTypes';
import { getAuthErrorMessage } from '../utils/authErrors';

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function signUp(credentials: AuthCredentials) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await signUpWithEmail(credentials);
      setSuccessMessage('Check your email to confirm your account.');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    errorMessage,
    isLoading,
    signUp,
    successMessage,
  };
}
