import { useSignOut } from '@/source/features/auth/hooks/useSignOut';
import { useCurrentProfile } from '@/source/features/profiles/hooks/useCurrentProfile';
import { Button } from '@/source/shared/ui/Button';
import { Screen } from '@/source/shared/ui/Screen';
import { Text } from '@/source/shared/ui/Text';

export default function ProtectedHomeScreen() {
  const { data: profile } = useCurrentProfile();
  const signOut = useSignOut();

  return (
    <Screen>
      <Text variant="title">Account ready</Text>
      <Text variant="body">
        Auth is active for {profile?.email ?? 'this account'}. Role-specific screens start in later
        modules.
      </Text>
      <Button isLoading={signOut.isLoading} label="Sign out" onPress={signOut.signOut} />
    </Screen>
  );
}
