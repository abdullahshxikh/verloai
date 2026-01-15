import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Lock, CheckCircle, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import { useTracks } from '../../lib/TracksProvider';
import { LEVELS } from '../../constants/levels';
import { useState } from 'react';
import { useProgress } from '../../lib/ProgressProvider';
import { GroqService } from '../../services/groq';

export default function PracticeScreen() {
  const router = useRouter();
  const { activeTrack } = useTracks();
  const { completedLevels } = useProgress();
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter levels for the active track, excluding assessment (order 0)
  const trackLevels = LEVELS
    .filter(l => l.track === activeTrack && l.id.indexOf('assessment') === -1 && l.order > 0)
    .sort((a, b) => a.order - b.order);

  const isLevelUnlocked = (levelId: string, order: number) => {
    // Level with order 1 is always unlocked
    if (order === 1) return true;

    // Find the level with order - 1 for THIS track
    const prevLevel = trackLevels.find(l => l.order === order - 1);
    if (!prevLevel) return true; // Fallback

    return completedLevels.includes(prevLevel.id);
  };

  const handleLevelPress = (level: typeof LEVELS[0]) => {
    if (isLevelUnlocked(level.id, level.order)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/level/[id]',
        params: { id: level.id }
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Locked", "Complete the previous scenario to unlock this one.");
    }
  };

  const handleGenerateAI = async () => {
    try {
      setIsGenerating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const difficulty = 'Advanced'; // Default for generated ones
      const newScenario = await GroqService.generateNewScenario(activeTrack, difficulty);

      if (newScenario) {
        // Navigate to level screen with the generated data
        router.push({
          pathname: '/level/generated',
          params: { data: JSON.stringify(newScenario) }
        });
      } else {
        Alert.alert("Error", "Could not generate scenario. Try again.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to generate AI scenario.");
    } finally {
      setIsGenerating(false);
    }
  };

  const allCompleted = trackLevels.length > 0 && trackLevels.every(l => completedLevels.includes(l.id));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Text style={styles.title}>{activeTrack.charAt(0).toUpperCase() + activeTrack.slice(1)} Lab</Text>
          <Text style={styles.subtitle}>Master your scenarios step by step.</Text>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {trackLevels.map((level, index) => {
          const unlocked = isLevelUnlocked(level.id, level.order);
          const isCompleted = completedLevels.includes(level.id);

          return (
            <Animated.View
              key={level.id}
              entering={FadeInDown.delay(200 + (index * 50)).duration(400)}
              style={styles.cardContainer}
            >
              <TouchableOpacity
                style={[styles.card, !unlocked && styles.cardLocked]}
                activeOpacity={unlocked ? 0.9 : 1}
                onPress={() => handleLevelPress(level)}
              >
                <View style={[styles.iconBox, { backgroundColor: unlocked ? 'rgba(108, 92, 231, 0.2)' : COLORS.surfaceLight }]}>
                  {unlocked ? (
                    isCompleted ? <CheckCircle size={24} color={COLORS.success} /> : <Play size={24} color={COLORS.primary} fill={COLORS.primary} />
                  ) : (
                    <Lock size={24} color={COLORS.textDim} />
                  )}
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{unlocked ? level.title : `Level ${level.order}`}</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.difficultyTag}>
                      <Text style={styles.difficultyText}>{unlocked ? level.difficulty : 'Locked'}</Text>
                    </View>
                    {isCompleted && (
                      <Text style={[styles.difficultyText, { color: COLORS.success, marginLeft: 8 }]}>Completed</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* AI Generator Card */}
        {allCompleted && (
          <Animated.View entering={FadeInUp.springify()} style={styles.cardContainer}>
            <TouchableOpacity
              style={[styles.card, styles.aiCard]}
              onPress={handleGenerateAI}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={['#6c5ce7', '#a29bfe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiIconBox}
              >
                {isGenerating ? <ActivityIndicator color="white" /> : <Sparkles size={24} color="white" />}
              </LinearGradient>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: '#a29bfe' }]}>Infinite AI Challenge</Text>
                <Text style={styles.cardSubtitle}>Generate a unique high-difficulty scenario</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {trackLevels.length === 0 && (
          <Text style={{ color: COLORS.textDim, textAlign: 'center', marginTop: 20 }}>
            No scenarios available for this track yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.l,
    paddingBottom: SPACING.m,
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
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: SPACING.m,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLocked: {
    opacity: 0.6,
    borderColor: 'transparent',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  tagRow: {
    flexDirection: 'row',
  },
  difficultyTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    color: COLORS.textDim,
    fontSize: 12,
    fontFamily: FONTS.body,
  },
  aiCard: {
    borderColor: '#6c5ce7',
    borderWidth: 1.5,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  aiIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});





