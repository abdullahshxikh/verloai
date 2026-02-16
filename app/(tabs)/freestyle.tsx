import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Minus, Plus, MessageCircle, Mic, Heart, Briefcase, Users, Zap } from 'lucide-react-native';
import { useState } from 'react';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useProgress } from '../../lib/ProgressProvider';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const AVATAR_SIZE = Math.min(width * 0.45, 200);

const TRACKS = [
  { key: 'general', label: 'General', icon: Zap },
  { key: 'dating', label: 'Dating', icon: Heart },
  { key: 'professional', label: 'Pro', icon: Briefcase },
  { key: 'social', label: 'Social', icon: Users },
];

// Avatar sources per track
const AVATAR_SOURCES: Record<string, any> = {
  general: require('../../assets/lottie/talking_man.json'),
  professional: require('../../assets/lottie/talking_man.json'),
  social: require('../../assets/lottie/talking_man.json'),
  dating_men: require('../../assets/lottie/talking_man.json'),
  dating_women: require('../../assets/lottie/female_avatar.json'),
  dating_auto: require('../../assets/lottie/talking_man.json'),
};

export default function FreestyleScreen() {
  const router = useRouter();
  const { datingAvatarPreference } = useProgress();
  const [difficulty, setDifficulty] = useState(5);
  const [selectedTrack, setSelectedTrack] = useState('general');

  const handleDifficulty = (val: number) => {
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    setDifficulty(val);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/freestyle-session',
      params: { difficulty, track: selectedTrack }
    });
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return "Warm Up";
    if (level <= 4) return "Casual";
    if (level <= 6) return "Balanced";
    if (level <= 8) return "Challenging";
    return "Expert";
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return COLORS.success;
    if (level <= 6) return COLORS.accent;
    if (level <= 8) return COLORS.warning;
    return COLORS.secondary;
  };

  // Get avatar source based on track and dating preference
  const getAvatarSource = () => {
    if (selectedTrack === 'dating') {
      const pref = datingAvatarPreference || 'auto';
      return AVATAR_SOURCES[`dating_${pref}`] || AVATAR_SOURCES.dating_auto;
    }
    return AVATAR_SOURCES[selectedTrack] || AVATAR_SOURCES.general;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#151518', COLORS.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={styles.title}>Freestyle Mode</Text>
          <Text style={styles.subtitle}>
            Pick a track and intensity, then handle whatever gets thrown at you
          </Text>
        </Animated.View>

        {/* Track Selection - Compact horizontal row */}
        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.trackRow}>
          {TRACKS.map((t) => {
            const isSelected = selectedTrack === t.key;
            const Icon = t.icon;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.trackPill, isSelected && styles.trackPillSelected]}
                onPress={() => { setSelectedTrack(t.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                activeOpacity={0.7}
              >
                <Icon size={16} color={isSelected ? '#fff' : COLORS.textDim} />
                <Text style={[styles.trackPillLabel, isSelected && styles.trackPillLabelSelected]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* AI Avatar */}
        <Animated.View entering={FadeInUp.delay(250).duration(600)} style={styles.avatarContainer}>
          <View style={styles.avatarGlow}>
            <LinearGradient
              colors={['rgba(108, 92, 231, 0.15)', 'rgba(108, 92, 231, 0.02)']}
              style={styles.avatarGlowGradient}
            />
          </View>
          <LottieView
            source={getAvatarSource()}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.avatarLabel}>Your AI opponent</Text>
        </Animated.View>

        {/* Difficulty Control */}
        <Animated.View entering={FadeInUp.delay(350).duration(500)} style={styles.controls}>
          <View style={styles.controlsHeader}>
            <Text style={styles.label}>AI INTENSITY</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(difficulty)}20` }]}>
              <Text style={[styles.difficultyBadgeText, { color: getDifficultyColor(difficulty) }]}>
                {getDifficultyLabel(difficulty)}
              </Text>
            </View>
          </View>

          <View style={styles.sliderRow}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleDifficulty(difficulty - 1)}
              activeOpacity={0.7}
            >
              <Minus size={20} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.sliderCenter}>
              <Text style={styles.difficultyValue}>{difficulty}</Text>
              <View style={styles.sliderTrack}>
                <LinearGradient
                  colors={[getDifficultyColor(difficulty), COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.sliderFill, { width: `${difficulty * 10}%` }]}
                />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>Easy</Text>
                <Text style={styles.sliderLabelText}>Hard</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleDifficulty(difficulty + 1)}
              activeOpacity={0.7}
            >
              <Plus size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Feature hints */}
        <Animated.View entering={FadeInUp.delay(450).duration(500)} style={styles.features}>
          <View style={styles.featureItem}>
            <Mic size={16} color={COLORS.textDim} />
            <Text style={styles.featureText}>Voice conversation</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featureItem}>
            <MessageCircle size={16} color={COLORS.textDim} />
            <Text style={styles.featureText}>Real-time feedback</Text>
          </View>
        </Animated.View>

        {/* Start Button */}
        <Animated.View entering={FadeInUp.delay(550).duration(500)} style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Freestyle</Text>
              <View style={styles.playIconContainer}>
                <Play size={18} color="#fff" fill="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.l,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 20,
  },
  // Track pills - compact horizontal row
  trackRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.m,
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceLight,
  },
  trackPillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  trackPillLabel: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
  },
  trackPillLabelSelected: {
    color: '#fff',
  },
  // Avatar section
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.m,
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    top: 10,
  },
  avatarGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  lottie: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginTop: -4,
    opacity: 0.6,
  },
  // Controls
  controls: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.m,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    letterSpacing: 1.2,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  difficultyValue: {
    fontSize: Math.min(42, width * 0.1),
    fontFamily: FONTS.display,
    color: COLORS.text,
    lineHeight: Math.min(48, width * 0.12),
    marginBottom: 8,
  },
  sliderTrack: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
  },
  sliderLabelText: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.l,
    opacity: 0.7,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textDim,
    marginHorizontal: 12,
  },
  footer: {
    width: '100%',
  },
  startButton: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 17,
    fontFamily: FONTS.bodyBold,
  },
  playIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
