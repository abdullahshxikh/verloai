import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ArrowLeft, Mic, Clock, BarChart3, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import OnboardingProgress from '../components/OnboardingProgress';

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Conversation',
    description: 'Chat naturally with an AI partner',
  },
  {
    icon: Clock,
    title: 'Takes ~2 Minutes',
    description: 'Quick and easy to complete',
  },
  {
    icon: BarChart3,
    title: 'Get Your Score',
    description: 'See where your charisma stands',
  },
];

export default function AssessmentReadyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/assessment',
      params: params,
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#1a1a2e', COLORS.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glow */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={['rgba(108, 92, 231, 0.15)', 'transparent']}
          style={styles.glow}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textDim} />
          </TouchableOpacity>
          <OnboardingProgress
            currentStep={6}
            totalSteps={7}
            style={{ flex: 1, marginHorizontal: 16 }}
            width="auto"
          />
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Badge */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.badgeContainer}>
            <LinearGradient
              colors={['rgba(108, 92, 231, 0.2)', 'rgba(108, 92, 231, 0.05)']}
              style={styles.badge}
            >
              <Sparkles size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>BASELINE ASSESSMENT</Text>
            </LinearGradient>
          </Animated.View>

          {/* Heading */}
          <Animated.View entering={FadeInUp.delay(350).springify()}>
            <Text style={styles.heading}>Let's find your{'\n'}starting point</Text>
            <Text style={styles.subheading}>
              Have a quick conversation so we can measure your charisma score and personalize your training.
            </Text>
          </Animated.View>

          {/* Feature cards */}
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInUp.delay(500 + index * 120).springify()}
                style={styles.featureCard}
              >
                <View style={styles.featureIconContainer}>
                  <feature.icon size={20} color={COLORS.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          {/* CTA */}
          <Animated.View entering={FadeInDown.delay(900).springify()} style={styles.footer}>
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
                <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>No pressure — you can retake it anytime</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  glowContainer: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 350,
    zIndex: 0,
  },
  glow: {
    flex: 1,
    borderRadius: 200,
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
    zIndex: 20,
    marginBottom: SPACING.l,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.l,
  },
  badgeContainer: {
    alignItems: 'flex-start',
    marginBottom: SPACING.l,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.5,
  },
  heading: {
    color: COLORS.text,
    fontSize: 32,
    fontFamily: FONTS.display,
    lineHeight: 40,
    marginBottom: SPACING.m,
  },
  subheading: {
    color: COLORS.textDim,
    fontSize: 16,
    fontFamily: FONTS.body,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
    marginBottom: 2,
  },
  featureDescription: {
    color: COLORS.textDim,
    fontSize: 13,
    fontFamily: FONTS.body,
  },
  footer: {
    paddingBottom: SPACING.m,
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
  },
  disclaimer: {
    color: COLORS.textDim,
    fontSize: 13,
    fontFamily: FONTS.body,
    textAlign: 'center',
    marginTop: 14,
    opacity: 0.7,
  },
});
