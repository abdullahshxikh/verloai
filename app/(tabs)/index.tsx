import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Zap, ArrowRight, Lock, Check, Briefcase, Users, Layers, Sparkles, Brain, Trophy, Mic } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { LEVELS } from '../../constants/levels';

import { useTracks } from '../../lib/TracksProvider';
import { TrackType } from '../../constants/levels';
import * as Haptics from 'expo-haptics';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthProvider';
import { InworldService } from '../../services/inworld';

import { useProgress } from '../../lib/ProgressProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 380;

const AVAILABLE_TRACKS: TrackType[] = ['general', 'professional', 'social', 'dating'];

export default function HomeScreen() {
  const router = useRouter();
  const { activeTrack, setActiveTrack } = useTracks();
  const { streak, xp, completedLevels } = useProgress();
  const { user } = useAuth();
  const [hasMemories, setHasMemories] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);

  // Check if user has enough memories for personalized scenarios
  useEffect(() => {
    if (user) {
      supabase.rpc('get_ai_memories', { p_limit: 1 }).then(({ data }) => {
        if (data && data.length > 0) {
          setHasMemories(true);
          // Get count
          supabase.rpc('get_ai_memories', { p_limit: 50 }).then(({ data: allData }) => {
            setMemoryCount(allData?.length || 0);
          });
        }
      });
    }
  }, [user, completedLevels]);

  const handleGeneratePersonalized = async () => {
    try {
      setIsGeneratingCustom(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Get memory summary from Supabase
      const { data: memorySummary } = await supabase.rpc('get_memory_summary_for_ai');

      if (!memorySummary) {
        setIsGeneratingCustom(false);
        return;
      }

      const track = activeTrack === 'general' ? 'social' : activeTrack;
      const scenario = await InworldService.generatePersonalizedScenario(memorySummary, track);

      if (scenario) {
        router.push({
          pathname: '/level/generated',
          params: { data: JSON.stringify(scenario) }
        });
      }
    } catch (e) {
      console.error('Personalized scenario failed:', e);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Check if all levels in the current track are completed
  const isTrackCompleted = useMemo(() => {
    if (activeTrack === 'general') {
      // "All" track — check if ALL non-assessment levels are done
      const allLevels = LEVELS.filter(l => l.id !== '0' && !l.id.startsWith('assessment-'));
      return allLevels.length > 0 && allLevels.every(l => completedLevels.includes(l.id));
    }
    const trackLevels = LEVELS.filter(l =>
      l.track === activeTrack && l.id !== '0' && !l.id.startsWith('assessment-')
    );
    return trackLevels.length > 0 && trackLevels.every(l => completedLevels.includes(l.id));
  }, [activeTrack, completedLevels]);

  const handleGenerateForTrack = async () => {
    try {
      setIsGeneratingCustom(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const track = activeTrack === 'general' ? 'social' : activeTrack;
      const scenario = await InworldService.generateScenarioFromMemories(track);

      if (scenario) {
        // Add the required fields
        scenario.id = 'custom-generated';
        scenario.order = 99;
        router.push({
          pathname: '/level/generated',
          params: { data: JSON.stringify(scenario) }
        });
      } else {
        // Fallback to memory-based if no memories for RPC approach
        const { data: memorySummary } = await supabase.rpc('get_memory_summary_for_ai');
        if (memorySummary) {
          const fallbackScenario = await InworldService.generatePersonalizedScenario(memorySummary, track);
          if (fallbackScenario) {
            fallbackScenario.id = 'custom-generated';
            fallbackScenario.order = 99;
            router.push({
              pathname: '/level/generated',
              params: { data: JSON.stringify(fallbackScenario) }
            });
          }
        }
      }
    } catch (e) {
      console.error('Track scenario generation failed:', e);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const getTrackLabel = (track: TrackType) => {
    switch (track) {
      case 'general': return 'All';
      case 'social': return 'Social';
      case 'professional': return 'Work';
      case 'dating': return 'Dating';
    }
  };

  const getTrackIcon = (track: TrackType, isActive: boolean) => {
    const color = isActive ? COLORS.text : COLORS.textDim;
    const size = 16;
    switch (track) {
      case 'general': return <Layers size={size} color={color} />;
      case 'social': return <Users size={size} color={color} />;
      case 'professional': return <Briefcase size={size} color={color} />;
      case 'dating': return <Zap size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Bar */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.topBar}>
          <Text style={styles.greeting}>Your Journey</Text>
          <View style={styles.leftPills}>
            <View style={styles.statPill}>
              <Flame size={16} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.statText}>{streak}</Text>
            </View>
            <View style={[styles.statPill, styles.xpPill]}>
              <Zap size={16} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.statText}>{xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>
        </Animated.View>

        {/* Track Switcher - Improved Design */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.trackSwitcherContainer}>
          <View style={styles.trackSwitcherContent}>
            {AVAILABLE_TRACKS.map((track) => {
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
                  activeOpacity={0.7}
                >
                  {isActive && (
                    <LinearGradient
                      colors={COLORS.primaryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  {getTrackIcon(track, isActive)}
                  <Text style={[styles.trackPillText, isActive && styles.trackPillTextActive]}>
                    {getTrackLabel(track)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Hero Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.heroSection}>
          <View style={styles.heroHeader}>
            <Text style={styles.dateText}>{getTrackLabel(activeTrack).toUpperCase()} SCENARIOS</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>
                {completedLevels.length} completed
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Level Up</Text>
          <Text style={styles.heroSubtitle}>
            Master {activeTrack === 'general' ? 'diverse' : activeTrack} conversations through real-world practice.
          </Text>
        </Animated.View>

        {/* AI Personalized Scenario Card - appears when memories exist */}
        {hasMemories && (
          <Animated.View entering={FadeInDown.delay(350).duration(500)} style={{ marginBottom: 18 }}>
            <TouchableOpacity
              style={styles.personalizedCard}
              onPress={handleGeneratePersonalized}
              disabled={isGeneratingCustom}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(108, 92, 231, 0.15)', 'rgba(255, 118, 117, 0.08)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.personalizedLeft}>
                <View style={styles.personalizedIconBox}>
                  {isGeneratingCustom ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Brain size={22} color="#fff" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personalizedTitle}>Made for You</Text>
                  <Text style={styles.personalizedDesc}>
                    AI scenario targeting your weak spots ({memoryCount} insights)
                  </Text>
                </View>
              </View>
              <View style={styles.personalizedArrow}>
                <Sparkles size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Level List */}
        <View style={styles.levelsContainer}>
          {(() => {
            let filtered = LEVELS.filter(l =>
              l.id !== '0' &&
              !l.id.startsWith('assessment-') &&
              (activeTrack === 'general' || l.track === activeTrack)
            );

            // Interleave tracks when viewing "All" - dating 1, social 1, professional 1, dating 2, social 2, etc.
            if (activeTrack === 'general') {
              const trackOrder: TrackType[] = ['dating', 'social', 'professional'];
              const byTrack: Record<string, typeof filtered> = {};
              trackOrder.forEach(t => {
                byTrack[t] = filtered.filter(l => l.track === t).sort((a, b) => a.order - b.order);
              });
              const maxLen = Math.max(...trackOrder.map(t => byTrack[t].length));
              const interleaved: typeof filtered = [];
              for (let i = 0; i < maxLen; i++) {
                for (const t of trackOrder) {
                  if (byTrack[t][i]) interleaved.push(byTrack[t][i]);
                }
              }
              filtered = interleaved;
            }

            return filtered;
          })().map((level, index, filteredList) => {
            const isCompleted = completedLevels.includes(level.id);

            let isUnlocked = false;

            if (activeTrack === 'general') {
              // In "All" view: sequential unlock based on position in the interleaved list
              // First item is always unlocked. Each subsequent item requires the previous one completed.
              if (index === 0) {
                isUnlocked = true;
              } else {
                const previousInList = filteredList[index - 1];
                isUnlocked = completedLevels.includes(previousInList.id);
              }
            } else {
              // In specific track view: unlock based on track order
              if (level.order === 1) {
                isUnlocked = true;
              } else {
                const previousLevel = LEVELS.find(l => l.track === level.track && l.order === level.order - 1);
                if (previousLevel && completedLevels.includes(previousLevel.id)) {
                  isUnlocked = true;
                }
              }
            }

            // Completed levels are always unlocked
            if (isCompleted) isUnlocked = true;
            const isLocked = !isUnlocked;

            return (
              <Animated.View
                key={level.id}
                entering={FadeInDown.delay(100 + index * 80).duration(500)}
                style={styles.levelCardWrapper}
              >
                <TouchableOpacity
                  style={[styles.levelCard, isLocked && styles.levelCardLocked, isCompleted && styles.levelCardCompleted]}
                  onPress={() => {
                    if (!isLocked) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/level/${level.id}`);
                    }
                  }}
                  activeOpacity={0.85}
                  disabled={isLocked}
                >
                  {!isLocked && !isCompleted && (
                    <LinearGradient
                      colors={['rgba(108, 92, 231, 0.08)', 'rgba(108, 92, 231, 0.02)']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}

                  <View style={styles.levelHeader}>
                    <View style={[
                      styles.levelBadge,
                      isCompleted && styles.levelBadgeCompleted,
                      isLocked && styles.levelBadgeLocked
                    ]}>
                      {isCompleted && <Check size={10} color={COLORS.background} style={{ marginRight: 4 }} />}
                      <Text style={[styles.levelBadgeText, isCompleted && styles.levelBadgeTextCompleted]}>
                        {isCompleted ? 'DONE' : `${level.track.toUpperCase()}`}
                      </Text>
                    </View>
                    <View style={styles.xpBadge}>
                      <Zap size={12} color={COLORS.warning} fill={COLORS.warning} />
                      <Text style={styles.levelXp}>{level.xp}</Text>
                    </View>
                  </View>

                  <Text style={[styles.levelTitle, isLocked && styles.levelTitleLocked]}>
                    {level.title}
                  </Text>
                  <Text style={[styles.levelDescription, isLocked && styles.levelDescriptionLocked]}>
                    {level.description}
                  </Text>

                  <View style={styles.levelFooter}>
                    <View style={[styles.difficultyPill, isLocked && styles.difficultyPillLocked]}>
                      <Text style={[styles.difficultyText, isLocked && styles.difficultyTextLocked]}>
                        {level.difficulty}
                      </Text>
                    </View>
                    {isLocked ? (
                      <View style={styles.lockIcon}>
                        <Lock size={18} color={COLORS.textDim} />
                      </View>
                    ) : (
                      <View style={[styles.playButton, isCompleted && styles.playButtonCompleted]}>
                        {isCompleted ? (
                          <Check size={18} color="#fff" />
                        ) : (
                          <ArrowRight size={18} color="#fff" />
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Track Completed Card — Generate New Scenarios */}
        {isTrackCompleted && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginTop: 20 }}>
            <View style={styles.trackCompleteCard}>
              <LinearGradient
                colors={['rgba(85, 239, 196, 0.12)', 'rgba(108, 92, 231, 0.08)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              <View style={styles.trackCompleteHeader}>
                <View style={styles.trackCompleteTrophyBox}>
                  <Trophy size={24} color="#fff" fill="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackCompleteTitle}>
                    {activeTrack === 'general' ? 'All Tracks' : getTrackLabel(activeTrack)} Complete!
                  </Text>
                  <Text style={styles.trackCompleteSubtitle}>
                    You've conquered every scenario. Keep going with AI-generated challenges.
                  </Text>
                </View>
              </View>

              <View style={styles.trackCompleteActions}>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateForTrack}
                  disabled={isGeneratingCustom}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={COLORS.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.generateButtonGradient}
                  >
                    {isGeneratingCustom ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Sparkles size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.generateButtonText}>Generate New Scenario</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.freestyleLinkButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(tabs)/freestyle');
                  }}
                  activeOpacity={0.7}
                >
                  <Mic size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.freestyleLinkText}>Or try Freestyle Mode</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />

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
    paddingTop: SPACING.m,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONTS.display,
    color: COLORS.text,
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
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    gap: 6,
  },
  xpPill: {
    backgroundColor: 'rgba(0, 206, 201, 0.1)',
    borderColor: 'rgba(0, 206, 201, 0.2)',
  },
  statText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
  },
  heroSection: {
    marginBottom: SPACING.l,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  dateText: {
    fontSize: 11,
    fontFamily: FONTS.bodyBold,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  progressBadge: {
    backgroundColor: 'rgba(85, 239, 196, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.success,
  },
  heroTitle: {
    fontSize: isSmallScreen ? 28 : 36,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: isSmallScreen ? 34 : 42,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 22,
  },
  levelsContainer: {
    gap: 14,
  },
  levelCardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  levelCardLocked: {
    opacity: 0.5,
    borderColor: 'transparent',
  },
  levelCardCompleted: {
    borderColor: 'rgba(85, 239, 196, 0.3)',
    backgroundColor: 'rgba(85, 239, 196, 0.05)',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelBadgeCompleted: {
    backgroundColor: COLORS.success,
  },
  levelBadgeLocked: {
    backgroundColor: COLORS.surfaceLight,
  },
  levelBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.bodyBold,
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  levelBadgeTextCompleted: {
    color: COLORS.background,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelXp: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    color: COLORS.warning,
  },
  levelTitle: {
    fontSize: 18,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 6,
  },
  levelTitleLocked: {
    color: COLORS.textDim,
  },
  levelDescription: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginBottom: 16,
    lineHeight: 19,
  },
  levelDescriptionLocked: {
    color: 'rgba(164, 164, 164, 0.6)',
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyPill: {
    backgroundColor: 'rgba(0, 206, 201, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyPillLocked: {
    backgroundColor: COLORS.surfaceLight,
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.accent,
  },
  difficultyTextLocked: {
    color: COLORS.textDim,
  },
  lockIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCompleted: {
    backgroundColor: COLORS.success,
  },
  trackSwitcherContainer: {
    marginBottom: SPACING.l,
  },
  trackSwitcherContent: {
    flexDirection: 'row',
    gap: 10,
  },
  trackPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 14,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    gap: isSmallScreen ? 4 : 6,
    overflow: 'hidden',
  },
  trackPillActive: {
    borderColor: COLORS.primary,
  },
  trackPillText: {
    fontSize: isSmallScreen ? 11 : 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
  },
  trackPillTextActive: {
    color: COLORS.text,
    fontFamily: FONTS.bodyBold,
  },
  personalizedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    overflow: 'hidden',
  },
  personalizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  personalizedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalizedTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 2,
  },
  personalizedDesc: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 17,
  },
  personalizedArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  // Track Complete Card
  trackCompleteCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(85, 239, 196, 0.25)',
    overflow: 'hidden',
  },
  trackCompleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  trackCompleteTrophyBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackCompleteTitle: {
    fontSize: 18,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 4,
  },
  trackCompleteSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 18,
  },
  trackCompleteActions: {
    gap: 12,
  },
  generateButton: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.3,
  },
  freestyleLinkButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  freestyleLinkText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.primary,
  },
});
