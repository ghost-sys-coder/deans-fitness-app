import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { AppProviders } from '@/source/core/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
