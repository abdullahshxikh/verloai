import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, CheckCircle, ArrowRight, Star } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import { useEffect } from 'react';
import { CharismaAnalysis } from '../services/openai';
import { COLORS, FONTS, SPACING } from '../constants/theme';

import { useAuth } from '../lib/AuthProvider';
import { useProgress } from '../lib/ProgressProvider';

export default function RevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session } = useAuth();
  const { completeLevel } = useProgress();

  const handleContinue = async () => {
    if (session) {
      // Authenticated user finishing a practice level
      if (params.levelId) {
        // Award XP (parse from params or default to 50)
        const xpAmount = params.levelXp ? parseInt(params.levelXp as string, 10) : 50;
        await completeLevel(params.levelId as string, xpAmount);
      }
      router.replace('/(tabs)');
    } else {
      // Onboarding flow
      router.push({
        pathname: '/impact',
        params: { ...params }
      });
    }
  };

  let scores: CharismaAnalysis = {
    charismaScore: 0,
    potentialNote: '',
    insights: []
  };

  try {
    if (params.result) {
      scores = JSON.parse(params.result as string);
    }
  } catch (e) { console.error(e); }

  if (!scores.charismaScore) {
    scores = {
      charismaScore: 62,
      potentialNote: "Your upside is strong — a few reps will make this feel effortless.",
      insights: [
        { type: 'improvement', text: 'Rush when unsure', detail: 'Pace increases under pressure.' },
        { type: 'improvement', text: 'Tone drops at ends', detail: 'Reduces perceived confidence.' },
        { type: 'strength', text: 'Great Clarity', detail: 'Articulation is very clear.' }
      ]
    };
  }

  // Animation for score counting could go here, but keeping it simple for now

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
          <Text style={styles.headerTitle}>ANALYSIS COMPLETE</Text>
        </Animated.View>

        {/* Score Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={styles.scoreContainer}>
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.mainScoreCircle}
          >
            <View style={styles.innerScoreCircle}>
              <Text style={styles.scoreLabel}>CHARISMA SCORE</Text>
              <Text style={styles.scoreValue}>{scores.charismaScore}</Text>
            </View>
          </LinearGradient>

          {!!scores.potentialNote && (
            <View style={styles.potentialBadge}>
              <Star size={16} color={COLORS.background} style={{ marginRight: 6 }} />
              <Text style={styles.potentialText}>{scores.potentialNote}</Text>
            </View>
          )}
        </Animated.View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>

          {scores.insights.map((item, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(400 + (index * 100)).duration(600)}
              style={styles.insightCard}
            >
              <View style={styles.insightHeader}>
                {item.type === 'improvement' ? (
                  <AlertCircle size={20} color={COLORS.secondary} style={{ marginRight: 12 }} />
                ) : (
                  <CheckCircle size={20} color={COLORS.success} style={{ marginRight: 12 }} />
                )}
                <Text style={styles.insightTitle}>{item.text}</Text>
              </View>
              <Text style={styles.insightDetail}>{item.detail}</Text>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <Animated.View entering={FadeInUp.delay(800)} style={styles.footer}>
        <View style={styles.softPaywallHint}>
          <Text style={styles.hintText}>Create an account to save your results & track progress</Text>
        </View>
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{session ? 'Finish' : 'Continue'}</Text>
            <ArrowRight size={20} color={COLORS.text} style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    paddingVertical: SPACING.l,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    letterSpacing: 1.5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  mainScoreCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    padding: 2, // Gradient border effect
    marginBottom: SPACING.l,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  innerScoreCircle: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    marginBottom: SPACING.s,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 80,
    fontFamily: FONTS.display,
    color: COLORS.text,
    lineHeight: 80,
  },
  potentialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: SPACING.m,
  },
  potentialText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.background,
  },
  potentialValue: {
    fontFamily: FONTS.bodyBold,
  },
  insightsSection: {
    paddingHorizontal: SPACING.l,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: SPACING.m,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.surfaceLight, // Default border
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    flex: 1,
  },
  insightDetail: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 22,
    paddingLeft: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.l,
    paddingBottom: SPACING.xl,
    backgroundColor: 'rgba(15,15,17,0.9)', // Semi-transparent background
  },
  softPaywallHint: {
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  hintText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    fontStyle: 'italic',
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
  },
});
