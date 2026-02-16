import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS } from '../constants/theme';
import { AuthProvider, useAuth } from '../lib/AuthProvider';
import { OnboardingProvider, useOnboarding } from '../lib/OnboardingProvider';
import { TracksProvider } from '../lib/TracksProvider';
import { ProgressProvider } from '../lib/ProgressProvider';
import { RevenueCatProvider, useRevenueCat } from '../lib/RevenueCatProvider';

function AppGate() {
  const { session, loading: authLoading } = useAuth();
  const { hasCompletedOnboarding, completeOnboarding, loading: onboardingLoading } = useOnboarding();
  const { isProMember, loading: rcLoading } = useRevenueCat();
  const segments = useSegments();
  const router = useRouter();

  const isNavigating = useRef(false);

  useEffect(() => {
    if (authLoading || onboardingLoading || rcLoading) return;
    if (isNavigating.current) return;

    const inAuth = segments[0] === 'auth';
    const inOnboarding = segments[0] === undefined ||
      ['gender', 'dating-preference', 'consent', 'goal', 'obstacles', 'time-investment', 'assessment-ready', 'assessment', 'processing', 'voice-preview', 'reveal', 'impact', 'projection', 'paywall', 'freestyle-session'].includes(segments[0] as string);
    const inTabs = segments[0] === '(tabs)';
    const inPaywall = segments[0] === 'paywall';

    const navigate = (path: string) => {
      isNavigating.current = true;
      router.replace(path as any);
      setTimeout(() => { isNavigating.current = false; }, 100);
    };

    // If onboarding not completed
    if (!hasCompletedOnboarding) {
      // If authenticated + Pro, they bought a sub — complete onboarding and go to tabs
      if (session && isProMember) {
        completeOnboarding();
        if (!inTabs) {
          navigate('/(tabs)');
        }
        return;
      }

      // If authenticated but not Pro, show paywall
      if (session) {
        if (!inPaywall) {
          navigate('/paywall');
        }
        return;
      }

      // If not authenticated, allow normal onboarding flow AND auth screens
      if (!inOnboarding && !inAuth) {
        navigate('/');
      }
      return;
    }

    // After seeing results (reveal screen), require authentication
    // If onboarding completed:
    if (!session) {
      if (!inAuth) {
        // If they logged out or session expired, send to signin
        navigate('/auth/signin');
      }
      return;
    }

    // HARD PAYWALL: If authenticated but NOT a Pro member, force paywall
    if (!isProMember) {
      if (!inPaywall) {
        navigate('/paywall');
      }
      return;
    }

    // If authenticated, onboarding completed, AND Pro member -> allow access to main app
    if ((segments[0] === undefined || inAuth || inPaywall)) {
      navigate('/(tabs)');
    }
  }, [session, hasCompletedOnboarding, authLoading, onboardingLoading, rcLoading, isProMember, segments]);

  if (authLoading || onboardingLoading || rcLoading) {
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
            <RevenueCatProvider>
              <AppGate />
            </RevenueCatProvider>
          </ProgressProvider>
        </OnboardingProvider>
      </TracksProvider>
    </AuthProvider>
  );
}
