import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, useAnimatedProps, withRepeat, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { GroqService } from '../services/groq';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useProgress } from '../lib/ProgressProvider';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { charismaScore, updateCharismaScore } = useProgress();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Analyzing acoustics...");

  // Animations
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const processAudio = async () => {
    try {
      // Mock or Real Processing
      let analysis: any = null;

      if (!params.uris) {
        // Mock delay 
        await new Promise(r => setTimeout(r, 2000));
        analysis = {
          charismaScore: 42, // Harsher score
          potentialNote: "You have significant blind spots.",
          insights: [
            { type: 'improvement', text: 'Lack of conviction', detail: 'Your voice trails off, signaling insecurity.' },
            { type: 'improvement', text: 'Low energy', detail: 'You sound disengaged, which makes others tune out.' },
            { type: 'strength', text: 'Clear diction', detail: 'At least your words are understandable.' }
          ]
        };
      } else {
        // Real processing
        const uris = JSON.parse(params.uris as string);
        // Only process first audio for now or merge
        if (uris.length > 0) {
          const transcripts = await Promise.all(uris.map((u: string) => GroqService.transcribeAudio(u)));
          // @ts-ignore: charismaScore might be ignored by analyzeAssessment but good to pass if needed
          analysis = await GroqService.analyzeAssessment(transcripts, charismaScore);

          if (analysis.charismaScore) {
            await updateCharismaScore(analysis.charismaScore);
          }
        }
      }

      // Fast forward animation
      setStatusText("Finalizing...");

      // We need to read current progress to start from there? 
      // Using a ref for progress would be better but we only have state. 
      // We can just assume we start from wherever the state is, but inside an async function state is stale.
      // So we'll validly animate from 90 to 100 (since we cap at 90).

      for (let i = 90; i <= 100; i++) {
        setProgress(i);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Make 100 vibrate harder
        if (i === 100) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        await new Promise(resolve => setTimeout(resolve, 30)); // fast!
      }

      // Delay slightly at 100
      await new Promise(resolve => setTimeout(resolve, 500));

      router.replace({
        pathname: '/reveal',
        params: { ...params, result: JSON.stringify(analysis) }
      });

    } catch (err: any) {
      console.error('Processing error:', err);
      // Fallback
      router.back();
    }
  };

  useEffect(() => {
    // Start pulse animation
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    processAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulating progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 0.2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Update status text based on progress
  useEffect(() => {
    if (progress < 90) {
      if (progress > 20 && progress < 50) setStatusText("Measuring confidence...");
      if (progress >= 50 && progress < 80) setStatusText("Evaluating clarity...");
      if (progress >= 80) setStatusText("Calculating Verlo Score...");
    }
  }, [progress]);

  // Update animated progress value
  useEffect(() => {
    animatedProgress.value = withTiming(progress / 100, { duration: 100 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * animatedProgress.value),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Animated.View style={[styles.circleContainer, pulseStyle]}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            {/* Background Circle */}
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke={COLORS.surfaceLight}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <AnimatedCircle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke={COLORS.primary}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              rotation="-90"
              origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.textContainer}>
          <Text style={styles.statusText}>{statusText}</Text>
          <Text style={styles.subText}>AI analyzing tone, pace, and clarity</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 48,
    fontFamily: FONTS.display,
    color: COLORS.text,
  },
  textContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 24,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  subText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
});
