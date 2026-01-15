import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Sparkles } from 'lucide-react-native';
import { useState, useRef } from 'react';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function FreestyleScreen() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState(5); // 1-10

  // Simplified Difficulty Slider UI (Track + Buttons for now to be safe, or just tap on track)
  const handleDifficulty = (val: number) => {
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    setDifficulty(val);
    Haptics.selectionAsync();
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/freestyle-session',
      params: { difficulty }
    });
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return "Casual Chat";
    if (level <= 6) return "Interview Prep";
    if (level <= 8) return "High Stakes";
    return "God Mode";
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <Sparkles size={32} color={COLORS.accent} style={{ marginBottom: 12 }} />
          <Text style={styles.title}>Freestyle Mode</Text>
          <Text style={styles.subtitle}>
            Practice without limits. Adjust the AI's intensity.
          </Text>
        </Animated.View>

        {/* Lottie Preview */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.lottieContainer}>
            <LottieView
              source={require('../../assets/lottie/talking_man.json')}
              style={{ width: 200, height: 200 }}
              autoPlay
              loop
            />
        </Animated.View>

        {/* Difficulty Control */}
        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.controls}>
          <Text style={styles.label}>INTENSITY LEVEL</Text>
          
          <View style={styles.sliderHeader}>
            <Text style={styles.difficultyValue}>{difficulty}</Text>
            <Text style={styles.difficultyLabel}>{getDifficultyLabel(difficulty)}</Text>
          </View>

          {/* Custom Slider Bar */}
          <View style={styles.sliderTrack}>
             <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.sliderFill, { width: `${difficulty * 10}%` }]}
             />
          </View>

          <View style={styles.sliderButtons}>
            <TouchableOpacity 
                style={styles.adjustButton} 
                onPress={() => handleDifficulty(difficulty - 1)}
            >
                <Text style={styles.adjustText}>-</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.adjustButton} 
                onPress={() => handleDifficulty(difficulty + 1)}
            >
                <Text style={styles.adjustText}>+</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.footer}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Conversation</Text>
              <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 8 }} />
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
    padding: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
    maxWidth: '80%',
  },
  lottieContainer: {
    marginBottom: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    letterSpacing: 1,
    marginBottom: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  difficultyValue: {
    fontSize: 48,
    fontFamily: FONTS.display,
    color: COLORS.text,
    lineHeight: 48,
  },
  difficultyLabel: {
    fontSize: 18,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.accent,
    marginBottom: 8,
  },
  sliderTrack: {
    height: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 6,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adjustButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustText: {
    fontSize: 32,
    color: COLORS.text,
    fontFamily: FONTS.body,
  },
  footer: {
    width: '100%',
  },
  startButton: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 20,
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





