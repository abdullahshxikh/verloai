import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Square, Volume2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { GroqService } from '../services/groq';

// 🎭 CHARACTER ANIMATION SOURCES
// Bundled locally so it always renders (remote Lottie URLs were returning 403).
// 🎭 CHARACTER ANIMATION SOURCES
// Now passed via props for dynamic selection


type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceConversationProps {
  scenario: {
    title: string;
    opener: string;
    role: string;
    systemPrompt?: string; // Optional custom prompt
  };
  levelContext?: { // Optional context modal data
    situation: string;
    action: string;
    goal: string;
  };
  onComplete: (uris: string[]) => void;
  onExit: () => void;
  onEndConversation?: (uris: string[]) => void;
  showEndButton?: boolean;
  avatarSource?: any; // Lottie JSON source
  voiceId?: string;
}

export default function VoiceConversation({ scenario, levelContext, onComplete, onExit, onEndConversation, showEndButton, avatarSource, voiceId = 'daniel' }: VoiceConversationProps) {
  // 🔄 STATE MACHINE
  const [status, setStatus] = useState<ConversationState>('idle');
  const [showContext, setShowContext] = useState(!!levelContext); // Show context if exists
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [recordedUris, setRecordedUris] = useState<string[]>([]);

  // 🎙️ AUDIO REFS
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isPressedRef = useRef(false); // Track button press state
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Track loading/playing state immediately to prevent races
  // const soundRef = useRef<Audio.Sound | null>(null); // REMOVED: Too complex
  const hasStarted = useRef(false);

  // Mutex lock to prevent overlapping playback requests
  const playbackLock = useRef(false);
  const recordingLock = useRef(false);

  // 🎨 ANIMATION REFS
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView | null>(null);

  // 🏗️ INITIALIZATION
  useEffect(() => {
    // Only start automatically if there's no context modal to show
    if (!showContext && !hasStarted.current) {
      startSession();
      startPulse();
    }
  }, [showContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // 🎭 LOTTIE CONTROL: Now controlled directly in speak() function
  // Removed automatic status-based animation to prevent desync

  // 🧹 CLEANUP
  const cleanupAudio = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) { /* ignore */ }
    }
    if (sound) {
      try {
        await sound.stopAsync(); // Ensure it stops playing
        await sound.unloadAsync();
      } catch (e) { /* ignore */ }
    }
    setSound(null);
    playbackLock.current = false;
    recordingRef.current = null;
  };

  // 💓 PULSE ANIMATION (Standard Animated)
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  // 🎬 SESSION START
  const startSession = async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    setStatus('speaking');
    setHistory([{ role: 'assistant', content: scenario.opener }]);
    await speak(scenario.opener);
  };

  // 🗣️ SPEAKING FUNCTION (OpenAI TTS)
  const speak = async (text: string) => {
    // 1. Lock: Prevent overlapping requests
    if (playbackLock.current) {
      console.log('🔒 Locked: ignoring overlap request');
      return;
    }
    playbackLock.current = true;

    try {
      console.log('🗣️ Speaking:', text.substring(0, 30) + '...');

      // 2. Stop Previous Sound (Clean Slate)
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (e) { /* ignore */ }
        setSound(null);
      }

      // 3. CRITICAL: Reset Audio Mode Completely
      console.log('🔧 Resetting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // 4. Fetch Audio
      console.log('🔄 Fetching TTS...');
      const uri = await GroqService.generateSpeech(text, voiceId);
      console.log('✅ TTS URI received');

      // 5. Load Sound (don't auto-play yet)
      console.log('🎵 Creating sound object...');
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(newSound);
      console.log('🎵 Sound created, starting playback...');

      // 6. Start Lottie animation RIGHT before playback
      const anim = lottieRef.current as any;
      if (anim?.play) anim.play();

      // 7. Manually start playback
      await newSound.playAsync();
      console.log('🎵 playAsync() called');

      // 8. Wait for finish with timeout
      const finished = await Promise.race([
        new Promise<boolean>((resolve) => {
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              console.log('🏁 Playback finished normally');
              resolve(true);
            }
          });
        }),
        new Promise<boolean>((resolve) => {
          setTimeout(() => {
            console.log('⏰ Playback timeout (10s)');
            resolve(false);
          }, 10000);
        })
      ]);

      // 9. Stop Lottie animation immediately
      if (anim?.pause) anim.pause();
      else if (anim?.reset) anim.reset();

      // Cleanup
      setStatus('idle');
      setSound(null);
      playbackLock.current = false;

    } catch (error) {
      console.error('❌ Speech failed:', error);
      // Stop animation on error
      const anim = lottieRef.current as any;
      if (anim?.pause) anim.pause();
      else if (anim?.reset) anim.reset();

      setStatus('idle');
      playbackLock.current = false;
    }
  };

  // 🎤 RECORDING FUNCTIONS
  const startRecording = async () => {
    isPressedRef.current = true;

    // 1. Lock: Prevent overlapping recording requests (Race Condition Fix)
    if (recordingLock.current || recordingRef.current) {
      console.log('🔒 Recording locked or active, ignoring');
      return;
    }
    recordingLock.current = true;

    try {
      console.log('🎤 Start recording requested');

      // 2. Interrupt AI if speaking
      if (sound) {
        try {
          // Force stop audio before recording to prevent resource conflict
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) { /* ignore */ }
        setSound(null);
      }
      playbackLock.current = false; // Force release playback lock

      const perm = await requestPermission();
      if (perm.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow microphone access to converse.');
        recordingLock.current = false;
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      console.log('🎤 Creating new recording...');

      // OPTIMIZED RECORDING OPTIONS: 16kHz (Whisper native), Mono, Low Bitrate
      // Reduces file size by ~80% for faster uploads/transcription
      const recordingOptions: any = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000, // Whisper native rate
          numberOfChannels: 1,
          bitRate: 32000, // 32kbps is enough for voice
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.LOW,
          sampleRate: 16000, // Whisper native rate
          numberOfChannels: 1,
          bitRate: 32000, // 32kbps
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );

      recordingRef.current = newRecording;

      // Check if user released while we were initializing
      if (!isPressedRef.current) {
        console.log('🎤 User released button early, stopping immediately');
        // We must release the lock temporarily for stopRecording to work? 
        // No, stopRecording doesn't check lock, it checks recordingRef.
        // But we are holding recordingLock.current = true.
        // stopRecording doesn't touch recordingLock. 
        // Wait, startRecording sets it to false in finally block.
        // If we call stopRecording here, it's async. 
        // we should let finally block handle lock release.
        await stopRecording();
        return;
      }

      setStatus('listening');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('🎤 Recording started');

    } catch (err) {
      console.error('❌ Failed to start recording', err);
      setStatus('idle');
      // Ensure we don't leave a zombie recording if createAsync partially failed
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) { }
        recordingRef.current = null;
      }
    } finally {
      recordingLock.current = false;
    }
  };

  const stopRecording = async () => {
    isPressedRef.current = false;

    if (!recordingRef.current) return;

    setStatus('processing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        setStatus('idle');
        return;
      }

      setRecordedUris((prev) => [...prev, uri]);

      // 1. Transcribe
      const userText = await GroqService.transcribeAudio(uri);
      const newHistory = [...history, { role: 'user' as const, content: userText }];
      setHistory(newHistory);

      // 2. Get AI Response
      const response = await GroqService.generateChallengeResponse(newHistory, scenario.systemPrompt);
      const aiText = response.text;

      // 3. Speak AI Response
      setHistory((prev) => [...prev, { role: 'assistant', content: aiText }]);

      // Wait for completion logic
      const shouldFinish = newHistory.length >= 4;

      if (shouldFinish) {
        // Speak then finish
        await speak(aiText);
        // Wait a bit then finish
        setTimeout(() => onComplete([...recordedUris, uri]), 1000);
      } else {
        // Just speak
        await speak(aiText);
      }

    } catch (error) {
      console.error('Turn failed', error);
      setStatus('idle');
      Alert.alert('Error', 'Could not process audio. Please try again.');
    }
  };

  // 🏷️ STATUS TEXT HELPER
  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Your turn';
      case 'listening': return 'Listening...';
      case 'processing': return 'Thinking...';
      case 'speaking': return 'Speaking...';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.closeButton}>
          <X size={24} color={COLORS.textDim} />
        </TouchableOpacity>
        <Text style={styles.scenarioTitle}>{scenario.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 🎭 CHARACTER AREA (Extends into controls for pop-out effect) */}
      <View style={styles.characterContainer}>
        <LottieView
          ref={lottieRef}
          source={avatarSource || require('../assets/lottie/talking_man.json')} // Default fallback
          autoPlay={false}
          loop={true}
          style={styles.lottie}
        />
      </View>

      {/* 🎮 CONTROLS AREA (Overlaps character to create cut-off effect) */}
      <View style={styles.controlsContainer}>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, status === 'listening' && styles.statusActive]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Mic Button */}
        <View style={styles.micContainer}>
          {status === 'processing' || status === 'speaking' ? (
            // Disabled / Processing State
            <View style={[styles.micButton, styles.micDisabled]}>
              {status === 'speaking' ? (
                <Volume2 size={32} color={COLORS.textDim} />
              ) : (
                <Animated.View style={{
                  transform: [{ scale: pulseAnim }],
                  width: '100%',
                  height: '100%',
                  borderRadius: 40,
                  backgroundColor: COLORS.surfaceLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: COLORS.primary
                }}>
                  <View style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: COLORS.primary
                  }} />
                </Animated.View>
              )}
            </View>
          ) : (
            // Interactive State
            <TouchableOpacity
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={styles.micWrapper}
              activeOpacity={0.8}
            >
              <Animated.View style={[
                styles.micPulse,
                status === 'listening' && { transform: [{ scale: pulseAnim }] }
              ]} />
              <LinearGradient
                colors={status === 'listening' ? COLORS.secondaryGradient : COLORS.primaryGradient}
                style={styles.micButton}
              >
                <Mic size={32} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.hintText}>
          {status === 'listening' ? 'Release to send' : 'Hold to speak'}
        </Text>

        {/* End Conversation Button (for Freestyle Mode) */}
        {showEndButton && recordedUris.length > 0 && (
          <TouchableOpacity
            style={styles.endButton}
            onPress={() => {
              if (onEndConversation) {
                onEndConversation(recordedUris);
              }
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.secondaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.endButtonGradient}
            >
              <Text style={styles.endButtonText}>End Conversation</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* 📜 CONTEXT MODAL OVERLAY */}
      {showContext && levelContext && (
        <View style={[StyleSheet.absoluteFill, styles.contextOverlay]}>
          <View style={styles.contextCard}>
            <TouchableOpacity
              onPress={() => {
                setShowContext(false);
                onExit();
              }}
              style={styles.contextCloseButton}
            >
              <X size={24} color={COLORS.textDim} />
            </TouchableOpacity>

            <Text style={styles.contextLabel}>SCENARIO BRIEF</Text>
            <Text style={styles.contextTitle}>{scenario.title}</Text>

            <View style={styles.contextSection}>
              <Text style={styles.contextSectionLabel}>SITUATION</Text>
              <Text style={styles.contextText}>{levelContext.situation}</Text>
            </View>

            <View style={styles.contextSection}>
              <Text style={styles.contextSectionLabel}>YOUR ACTION</Text>
              <Text style={styles.contextText}>{levelContext.action}</Text>
            </View>

            <View style={styles.contextSection}>
              <Text style={styles.contextSectionLabel}>GOAL</Text>
              <Text style={styles.contextText}>{levelContext.goal}</Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                setShowContext(false);
                startSession();
                startPulse();
              }}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startButtonText}>Start Scenario</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contextOverlay: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: SPACING.l,
  },
  contextCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    position: 'relative',
  },
  contextCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    zIndex: 10,
  },
  contextLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  contextTitle: {
    fontSize: 24,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 24,
  },
  contextSection: {
    marginBottom: 20,
  },
  contextSectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  contextText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  startButton: {
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.text,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingTop: 60,
    paddingBottom: SPACING.m,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  scenarioTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  characterContainer: {
    flex: 0.5, // Reduced to make room for larger voice area
    justifyContent: 'flex-end', // Align animation to bottom of container
    alignItems: 'center',
    paddingBottom: 0,
    zIndex: 1, // Behind controls
  },
  lottie: {
    width: 320,
    height: 320,
    backgroundColor: 'transparent',
    marginBottom: -40,
  },

  controlsContainer: {
    flex: 0.5, // Increased to 50% for more space in voice area
    backgroundColor: COLORS.background, // Solid background to cut off animation
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingTop: 70, // Padding to accommodate overlapping animation
    paddingBottom: SPACING.l,
    zIndex: 2, // Above character container to cut it off
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusContainer: {
    marginBottom: SPACING.xl, // Increased spacing for better breathing room
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusText: {
    fontSize: 18,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
    letterSpacing: 1,
  },
  statusActive: {
    color: COLORS.text,
    fontFamily: FONTS.bodyBold,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: 120,
    marginBottom: SPACING.m,
  },
  micWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2,
  },
  micDisabled: {
    backgroundColor: COLORS.surfaceLight,
    shadowOpacity: 0,
  },
  micPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(108, 92, 231, 0.2)', // Primary with opacity
    zIndex: 1,
  },
  processingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.textDim,
  },
  hintText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    opacity: 0.6,
    marginBottom: SPACING.m,
  },
  endButton: {
    marginTop: SPACING.m,
    width: '80%',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  endButtonGradient: {
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  endButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
  },
});








