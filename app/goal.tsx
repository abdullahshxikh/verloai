import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Briefcase, Heart, Check, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import OnboardingProgress from '../components/OnboardingProgress';
import { useTracks } from '../lib/TracksProvider';
import { TrackType } from '../constants/levels';

type Goal = 'social' | 'professional' | 'dating' | 'leadership' | 'networking';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function GoalScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const goals = [
    {
      id: 'social',
      title: 'Social Confidence',
      description: 'Sound more engaging and relaxed in groups.',
      icon: Users,
      gradient: ['#4FACFE', '#00F2FE'] // Blue Cyan
    },
    {
      id: 'professional',
      title: 'Professional Presence',
      description: 'Speak with authority and clarity at work.',
      icon: Briefcase,
      gradient: ['#F6D365', '#FDA085'] // Warm Orange
    },
    {
      id: 'dating',
      title: 'Dating & Charm',
      description: 'Build connection and express warmth.',
      icon: Heart,
      gradient: ['#84fab0', '#8fd3f4'] // Minty
    },
    {
      id: 'leadership',
      title: 'Leadership',
      description: 'Inspire others and command respect.',
      icon: Briefcase, // Using Briefcase again or maybe a different one if available, but Briefcase is fine for now. Or maybe generic User.
      gradient: ['#a18cd1', '#fbc2eb'] // Purple/Pink
    },
    {
      id: 'networking',
      title: 'Networking',
      description: 'Make lasting connections instantly.',
      icon: Users,
      gradient: ['#ff9a9e', '#fecfef'] // Pink/Peach
    },
  ];

  const handleSelect = (id: Goal) => {
    if (selectedGoal !== id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedGoal(id);
    }
  };

  const { setActiveTrack } = useTracks();

  const handleContinue = async () => {
    if (selectedGoal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Map goal to track
      let track: TrackType = 'general';
      switch (selectedGoal) {
        case 'social':
          track = 'social';
          break;
        case 'professional':
        case 'leadership':
        case 'networking':
          track = 'professional';
          break;
        case 'dating':
          track = 'dating';
          break;
      }

      await setActiveTrack(track);

      router.push({
        pathname: '/obstacles',
        params: { goal: selectedGoal }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#1a1a2e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <OnboardingProgress currentStep={3} totalSteps={7} />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <Text style={styles.title}>What’s your main focus?</Text>
          <Text style={styles.subtitle}>
            This helps us customize your charisma score and daily challenges.
          </Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {goals.map((goal, index) => {
            const isSelected = selectedGoal === goal.id;
            const Icon = goal.icon;

            return (
              <Animated.View
                key={goal.id}
                entering={FadeInDown.delay(400 + (index * 100)).springify()}
                style={styles.cardContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected
                  ]}
                  onPress={() => handleSelect(goal.id as Goal)}
                  activeOpacity={0.9}
                >
                  {/* Background Gradient for selection */}
                  {isSelected && (
                    <LinearGradient
                      colors={goal.gradient as unknown as readonly [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
                    />
                  )}

                  <View style={styles.cardInner}>
                    <View style={[styles.iconBox, isSelected && { backgroundColor: goal.gradient[0] }]}>
                      <Icon size={24} color={isSelected ? '#fff' : COLORS.textDim} />
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, isSelected && { color: goal.gradient[0] }]}>
                        {goal.title}
                      </Text>
                      <Text style={styles.cardDescription}>
                        {goal.description}
                      </Text>
                    </View>

                    <View style={[styles.checkCircle, isSelected && { backgroundColor: goal.gradient[0], borderColor: goal.gradient[0] }]}>
                      {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !selectedGoal && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!selectedGoal}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedGoal ? COLORS.primaryGradient : (['#333', '#333'] as const)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={[styles.buttonText, !selectedGoal && { color: '#666' }]}>
                Continue
              </Text>
              {selectedGoal && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.l,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 5,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0, // Removed side borders
  },
  header: {
    paddingTop: 80,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.l, // Keep header text padded
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.m,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 24,
  },
  optionsContainer: {
    paddingBottom: 100,
    paddingHorizontal: SPACING.s, // Minimal padding for cards
  },
  cardContainer: {
    marginBottom: SPACING.m,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: 'rgba(255,255,255,0.2)',
    transform: [{ scale: 1.02 }],
  },
  cardInner: {
    padding: SPACING.l,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  cardContent: {
    flex: 1,
    marginRight: SPACING.s,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 20,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.l,
    right: SPACING.l,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 30,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
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
  },
});
