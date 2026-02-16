/**
 * Voice Preview Screen
 *
 * Shows after baseline assessment:
 * 1. "This is how you COULD sound"
 * 2. Plays enhanced version of user's voice with perfect delivery
 * 3. Shows trajectory/potential
 * 4. Option to enable voice cloning for practice
 */

import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { Audio } from 'expo-av';
import InworldService from '../services/inworld';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function VoicePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [voiceCloned, setVoiceCloned] = useState(false);
  const [enhancedAudioUri, setEnhancedAudioUri] = useState<string | null>(null);

  const result = params.result ? JSON.parse(params.result as string) : null;
  const audioUris = params.uris ? JSON.parse(params.uris as string) : [];
  const charismaScore = result?.charismaScore || 42;

  // Calculate potential score (what they could reach)
  const potentialScore = Math.min(charismaScore + 25, 85);

  // Example enhanced script (perfect version of what they said)
  const enhancedScript = "You have incredible potential. With focused practice, your communication skills will transform. Your voice can inspire confidence and connection.";

  useEffect(() => {
    cloneVoiceAndGeneratePreview();

    return () => {
      // Cleanup sound on unmount
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, []);

  const cloneVoiceAndGeneratePreview = async () => {
    try {
      setIsLoading(true);

      // Check if we have audio from assessment
      if (!audioUris || audioUris.length === 0) {
        throw new Error('No audio samples available');
      }

      // Use the longest audio sample for better voice cloning
      const longestAudio = audioUris.reduce((longest: string, current: string) => {
        // In a real implementation, you'd check file sizes
        // For now, just use the first one
        return longest || current;
      });

      console.log('[VoicePreview] Cloning voice from:', longestAudio);

      // Clone voice with Inworld
      const voiceId = await InworldService.cloneVoice(
        longestAudio,
        'My Voice',
        'Voice clone for CharismaAI practice',
        undefined // No transcription needed for Inworld
      );

      console.log('[VoicePreview] Voice cloned:', voiceId);
      setVoiceCloned(true);

      // Generate enhanced preview with cloned voice
      console.log('[VoicePreview] Generating enhanced preview...');
      const audioUri = await InworldService.synthesizeSpeech(
        enhancedScript,
        voiceId,
        10000 // 10 second timeout for preview
      );

      if (audioUri) {
        setEnhancedAudioUri(audioUri);
        console.log('[VoicePreview] Preview ready:', audioUri);
      } else {
        throw new Error('Voice synthesis timeout');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[VoicePreview] Error:', error);
      Alert.alert(
        'Voice Preview Unavailable',
        'We couldn\'t generate your voice preview. You can still continue with the assessment results.',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace({
                pathname: '/reveal',
                params: params
              });
            }
          }
        ]
      );
      setIsLoading(false);
    }
  };

  const playEnhancedVoice = async () => {
    try {
      if (!enhancedAudioUri) {
        Alert.alert('Error', 'Enhanced voice preview not ready');
        return;
      }

      // Stop any currently playing sound
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      setIsPlaying(true);

      const { sound } = await Audio.Sound.createAsync(
        { uri: enhancedAudioUri },
        { shouldPlay: true }
      );

      setCurrentSound(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('[VoicePreview] Playback error:', error);
      setIsPlaying(false);
      Alert.alert('Playback Error', 'Could not play enhanced voice preview');
    }
  };

  const handleContinue = async () => {
    // Enable voice cloning for future practice sessions
    await AsyncStorage.setItem('voice_cloning_enabled', 'true');

    // Navigate to reveal screen with results
    router.replace({
      pathname: '/reveal',
      params: params
    });
  };

  const handleSkip = async () => {
    // Disable voice cloning
    await AsyncStorage.setItem('voice_cloning_enabled', 'false');

    // Delete the cloned voice
    await InworldService.deleteVoice();

    // Navigate to reveal screen
    router.replace({
      pathname: '/reveal',
      params: params
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[COLORS.background, COLORS.surface]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/lottie/avatar_pulse.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.loadingText}>Creating your voice preview...</Text>
          <Text style={styles.loadingSubtext}>Analyzing vocal patterns and tone</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text style={styles.title}>This is how you</Text>
          <Text style={[styles.title, styles.titleEmphasis]}>COULD sound</Text>
        </Animated.View>

        {/* Potential Score */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.scoreContainer}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Current</Text>
              <Text style={styles.scoreValue}>{charismaScore}</Text>
            </View>

            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>

            <View style={[styles.scoreBox, styles.scoreBoxPotential]}>
              <Text style={styles.scoreLabel}>Potential</Text>
              <Text style={[styles.scoreValue, styles.potentialValue]}>{potentialScore}</Text>
            </View>
          </View>

          <Text style={styles.potentialText}>
            +{potentialScore - charismaScore} point improvement possible
          </Text>
        </Animated.View>

        {/* Play Button */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.playContainer}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={playEnhancedVoice}
            disabled={isPlaying || !enhancedAudioUri}
          >
            <Text style={styles.playButtonIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Playing...' : 'Hear Your Potential'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.playSubtext}>
            ✨ Your voice with perfect delivery
          </Text>
        </Animated.View>

        {/* Benefits */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>With voice cloning enabled:</Text>

          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>AI speaks with <Text style={styles.bold}>your voice</Text> during practice</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🔄</Text>
            <Text style={styles.benefitText}>Hear yourself deliver <Text style={styles.bold}>perfect responses</Text></Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🧠</Text>
            <Text style={styles.benefitText}>Faster learning through <Text style={styles.bold}>self-modeling</Text></Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Enable Voice Cloning</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
            <Text style={styles.secondaryButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
    marginTop: SPACING.m,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginTop: SPACING.s,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.text,
    textAlign: 'center',
  },
  titleEmphasis: {
    color: COLORS.primary,
    fontSize: 36,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  scoreBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.l,
    alignItems: 'center',
    minWidth: 120,
  },
  scoreBoxPotential: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginBottom: SPACING.s,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: FONTS.display,
    color: COLORS.text,
  },
  potentialValue: {
    color: COLORS.primary,
  },
  arrow: {
    marginHorizontal: SPACING.m,
  },
  arrowText: {
    fontSize: 32,
    color: COLORS.primary,
  },
  potentialText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.primary,
  },
  playContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingVertical: SPACING.l,
    paddingHorizontal: SPACING.xl * 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  playButtonIcon: {
    fontSize: 24,
    color: COLORS.background,
  },
  playButtonText: {
    fontSize: 18,
    fontFamily: FONTS.display,
    color: COLORS.background,
  },
  playSubtext: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginTop: SPACING.m,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.l,
    marginBottom: SPACING.xl,
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.s,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: SPACING.m,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  bold: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
  },
  actions: {
    gap: SPACING.m,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.l,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display,
    color: COLORS.background,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: SPACING.m,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
});
