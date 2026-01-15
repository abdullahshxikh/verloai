import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { COLORS } from '../constants/theme';
import { AuthProvider, useAuth } from '../lib/AuthProvider';
import { OnboardingProvider, useOnboarding } from '../lib/OnboardingProvider';
import { TracksProvider } from '../lib/TracksProvider';
import { ProgressProvider } from '../lib/ProgressProvider';

function AppGate() {
  const { session, loading: authLoading } = useAuth();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || onboardingLoading) return;

    const inAuth = segments[0] === 'auth';
    const inOnboarding = segments[0] === undefined ||
      ['gender', 'consent', 'goal', 'obstacles', 'time-investment', 'assessment-ready', 'assessment', 'processing', 'reveal', 'impact', 'projection'].includes(segments[0] as string);
    const inTabs = segments[0] === '(tabs)';
    const inPaywall = segments[0] === 'paywall';

    // If onboarding not completed
    if (!hasCompletedOnboarding) {
      // If authenticated, they must have just signed up/in -> Go to Paywall
      if (session) {
        if (!inPaywall) {
          router.replace('/paywall');
        }
        return;
      }

      // If not authenticated, allow normal onboarding flow AND auth screens
      if (!inOnboarding && !inAuth) {
        router.replace('/');
      }
      return;
    }

    // After seeing results (reveal screen), require authentication
    // If onboarding completed (passed Paywall):
    if (!session) {
      if (!inAuth) {
        // If they logged out or session expired, send to signin
        router.replace('/auth/signin');
      }
      return;
    }

    // If authenticated and onboarding completed, allow access to main app
    if (segments[0] === undefined || inAuth || inPaywall) {
      router.replace('/(tabs)');
    }
  }, [session, hasCompletedOnboarding, authLoading, onboardingLoading, segments]);

  if (authLoading || onboardingLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
        }}
      />
      <StatusBar style="light" />
    </>
  );
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <TracksProvider>
        <OnboardingProvider>
          <ProgressProvider>
            <AppGate />
          </ProgressProvider>
        </OnboardingProvider>
      </TracksProvider>
    </AuthProvider>
  );
}
