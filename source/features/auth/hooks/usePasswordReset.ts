import { useState } from 'react';

import { passwordResetSchema } from '../schemas/authSchemas';
import { sendPasswordResetEmail } from '../services/authService';
import { authCallbackUrl } from '../services/oauthService';
import { getAuthErrorMessage } from '../utils/authErrors';

export function usePasswordReset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function sendResetLink() {
    const result = passwordResetSchema.safeParse({ email });

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? 'Enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(result.data.email, authCallbackUrl);
      setSuccessMessage('Check your email for a password reset link.');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    errorMessage,
    isLoading,
    sendResetLink,
    setEmail,
    successMessage,
  };
}
