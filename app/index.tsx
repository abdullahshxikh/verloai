import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function HookScreen() {
  const router = useRouter();

  // Animation values
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.5,
  }));

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/gender');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#1a1a2e']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.iconContainer}>
          <Animated.View style={[styles.pulseCircle, animatedCircleStyle]} />
          <View style={styles.iconCircle}>
            <Mic size={40} color={COLORS.text} />
          </View>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <Text style={styles.headline}>
            Find your <Text style={styles.highlight}>Charisma Score</Text> in 60 seconds.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <Text style={styles.subheadline}>
            AI analysis of your confidence, clarity, and warmth.
          </Text>
        </Animated.View>

        <View style={styles.spacer} />

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(800).springify()} style={{ width: '100%' }}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={handleStart}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Start Assessment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },
  headline: {
    fontSize: 36,
    fontFamily: FONTS.display,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: SPACING.m,
  },
  highlight: {
    color: COLORS.primary,
  },
  subheadline: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
    paddingHorizontal: SPACING.m,
  },
  spacer: {
    height: 80,
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    paddingVertical: 20,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
  },
});
