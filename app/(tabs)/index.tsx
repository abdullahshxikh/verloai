import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Zap, ArrowRight, BarChart2, User, ChevronRight, Lock, Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { LEVELS } from '../../constants/levels';

import { useTracks } from '../../lib/TracksProvider';
import { TrackType } from '../../constants/levels';
import * as Haptics from 'expo-haptics';

import { useProgress } from '../../lib/ProgressProvider';

export default function HomeScreen() {
  const router = useRouter();
  const { activeTrack, setActiveTrack } = useTracks();
  const { streak, xp, completedLevels } = useProgress();

  const getTrackLabel = (track: TrackType) => {
    switch (track) {
      case 'general': return 'Overall';
      case 'social': return 'Social';
      case 'professional': return 'Professional';
      case 'dating': return 'Dating';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.leftPills}>
            <View style={styles.statPill}>
              <Flame size={16} color={COLORS.warning} fill={COLORS.warning} style={{ marginRight: 6 }} />
              <Text style={styles.statText}>{streak}</Text>
            </View>
            <View style={styles.statPill}>
              <Zap size={16} color={COLORS.accent} fill={COLORS.accent} style={{ marginRight: 6 }} />
              <Text style={styles.statText}>{xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Track Switcher */}
        <View style={styles.trackSwitcherContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trackSwitcherContent}>
            {(['general', 'professional', 'social', 'dating'] as TrackType[]).map((track) => {
              const isActive = activeTrack === track;
              return (
                <TouchableOpacity
                  key={track}
                  style={[styles.trackPill, isActive && styles.trackPillActive]}
                  onPress={() => {
                    if (!isActive) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveTrack(track);
                    }
                  }}
                >
                  <Text style={[styles.trackPillText, isActive && styles.trackPillTextActive]}>
                    {getTrackLabel(track)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hero Section */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.heroSection}>
          <Text style={styles.dateText}>{getTrackLabel(activeTrack).toUpperCase()} PATH</Text>
          <Text style={styles.heroTitle}>Level Up</Text>
          <Text style={styles.heroSubtitle}>
            Progress through {activeTrack === 'general' ? 'mixed' : activeTrack} scenarios to build your charisma.
          </Text>
        </Animated.View>

        {/* Level List */}
        <View style={styles.levelsContainer}>
          {LEVELS.filter(l => l.id !== '0' && !l.id.startsWith('assessment-') && (activeTrack === 'general' || l.track === activeTrack)).map((level, index) => {
            // Unlocking Logic
            // Level 1 is always unlocked.
            // Others unlocked if previous ordered level in the same track is in completedLevels.
            const isCompleted = completedLevels.includes(level.id);

            let isUnlocked = level.order === 1;

            if (!isUnlocked) {
              // Find the previous level for this specific track
              // Note: This assumes strict sequential ordering 1, 2, 3... in definitions
              // If tracks are mixed in 'general' view, we might want to check if *any* previous level is done?
              // But usually progress is track-specific.
              // For 'general' view, let's assume we show all, but unlocking respects the track's progression.

              const previousLevel = LEVELS.find(l => l.track === level.track && l.order === level.order - 1);
              if (previousLevel && completedLevels.includes(previousLevel.id)) {
                isUnlocked = true;
              }
            }

            const isLocked = !isUnlocked;

            return (
              <Animated.View
                key={level.id}
                entering={FadeInDown.delay(index * 100).duration(600)}
                style={styles.levelCardWrapper}
              >
                <TouchableOpacity
                  style={[styles.levelCard, isLocked && styles.levelCardLocked]}
                  onPress={() => {
                    if (!isLocked) {
                      router.push(`/level/${level.id}`);
                    }
                  }}
                  activeOpacity={0.9}
                  disabled={isLocked}
                >
                  <View style={styles.levelHeader}>
                    <View style={[
                      styles.levelBadge,
                      { backgroundColor: isCompleted ? COLORS.success : (isLocked ? COLORS.surfaceLight : COLORS.primary) }
                    ]}>
                      <Text style={styles.levelBadgeText}>
                        {isCompleted ? 'COMPLETED' : `LEVEL ${level.id}`}
                      </Text>
                    </View>
                    <Text style={styles.levelXp}>{level.xp} XP</Text>
                  </View>

                  <Text style={[styles.levelTitle, isLocked && { color: COLORS.textDim }]}>
                    {level.title}
                  </Text>
                  <Text style={styles.levelDescription}>
                    {level.description}
                  </Text>

                  <View style={styles.levelFooter}>
                    <View style={styles.difficultyPill}>
                      <Text style={[styles.difficultyText, { color: isLocked ? COLORS.textDim : COLORS.accent }]}>
                        {level.difficulty}
                      </Text>
                    </View>
                    {isLocked ? (
                      <Lock size={20} color={COLORS.textDim} />
                    ) : (
                      <View style={[styles.playButton, isCompleted && { backgroundColor: COLORS.success }]}>
                        {isCompleted ? (
                          <Check size={20} color={COLORS.background} />
                        ) : (
                          <ArrowRight size={20} color={COLORS.background} />
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  leftPills: {
    flexDirection: 'row',
    gap: SPACING.s,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  heroSection: {
    marginBottom: SPACING.l,
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    marginBottom: SPACING.s,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.s,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginBottom: SPACING.l,
    lineHeight: 24,
  },
  levelsContainer: {
    gap: SPACING.m,
  },
  levelCardWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  levelCardLocked: {
    opacity: 0.7,
    borderColor: 'transparent',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    letterSpacing: 1,
  },
  levelXp: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.warning,
  },
  levelTitle: {
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginBottom: 20,
    lineHeight: 20,
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyPill: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackSwitcherContainer: {
    marginBottom: SPACING.l,
  },
  trackSwitcherContent: {
    paddingHorizontal: 4, // Align with left padding of screen if needed, but ScrollView works better with horizontal padding in container style if not full width
    gap: 8,
  },
  trackPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  trackPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  trackPillText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
  },
  trackPillTextActive: {
    color: COLORS.text,
    fontFamily: FONTS.bodyBold,
  },
});
