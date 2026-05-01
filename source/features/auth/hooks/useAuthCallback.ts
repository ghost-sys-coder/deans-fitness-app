import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { router, type Href } from 'expo-router';

import { completeOAuthSessionFromUrl } from '../services/oauthService';

export function useAuthCallback() {
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) {
      return;
    }

    const callbackUrl = url;

    async function completeSession() {
      await completeOAuthSessionFromUrl(callbackUrl);
      router.replace('/home' as Href);
    }

    void completeSession();
  }, [url]);
}
