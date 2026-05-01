import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type ReactNode } from 'react';

import { useTheme } from '@/source/shared/theme/ThemeProvider';

type AuthScreenProps = {
  children: ReactNode;
};

export function AuthScreen({ children }: AuthScreenProps) {
  const { tokens } = useTheme();

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('@/assets/auth-images/auth-bg-image.png')}
      style={styles.background}
    >
      <View style={[styles.overlay, { backgroundColor: tokens.colors.overlay }]} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              gap: tokens.spacing.lg,
              padding: tokens.spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: tokens.colors.backgroundElevated,
                borderColor: tokens.colors.border,
                borderRadius: tokens.radii.xl,
                gap: tokens.spacing.lg,
                padding: tokens.spacing.xl,
              },
            ]}
          >
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    width: '100%',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
});
