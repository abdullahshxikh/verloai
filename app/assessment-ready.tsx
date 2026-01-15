import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ArrowLeft } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { GroqService } from '../services/groq';
import OnboardingProgress from '../components/OnboardingProgress';

export default function AssessmentReadyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const lottieRef = useRef<LottieView | null>(null);

  const introText = "Hey! I'm Daniel, your personal Charisma Coach. I just need to get a quick baseline to see where you're at. Hit that start button, and we'll jump right in.";

  useEffect(() => {
    playIntro();
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) { /* ignore */ }
    }
  };

  const playIntro = async () => {
    try {
      // 1. Configure Audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // 2. Fetch Speech
      const uri = await GroqService.generateSpeech(introText, 'daniel');

      // 3. Create Sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(newSound);

      // 4. Play
      if (lottieRef.current) lottieRef.current.play();
      await newSound.playAsync();

      // 5. Stop Lottie on Finish
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          if (lottieRef.current) lottieRef.current.pause();
        }
      });
    } catch (error) {
      console.error('Intro speech failed:', error);
      if (lottieRef.current) lottieRef.current.pause();
    }
  };

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await stopAudio();
    router.push({
      pathname: '/assessment',
      params: params
    });
  };

  const handleBack = async () => {
    await stopAudio();
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#1a1a2e']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.avatarContainer}>
        <LottieView
          ref={lottieRef}
          source={require('../assets/lottie/talking_man.json')}
          autoPlay={false}
          loop={true}
          style={styles.lottie}
        />
      </Animated.View>

      {/* Footer Gradient Overlay */}
      <LinearGradient
        colors={['transparent', COLORS.background]}
        style={styles.footerGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textDim} />
          </TouchableOpacity>
          <OnboardingProgress
            currentStep={3}
            totalSteps={3}
            style={{ flex: 1, marginHorizontal: 16 }}
            width="auto"
          />
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={{ flex: 1 }} />

          <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.footer}>
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={handleStart}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Start Assessment</Text>
                <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
    zIndex: 20,
    marginBottom: SPACING.l,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.l,
  },
  avatarContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginTop: -80,
  },
  lottie: {
    width: 380,
    height: 380,
  },
  footerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 5,
  },
  footer: {
    paddingBottom: SPACING.m,
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
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
    letterSpacing: 0.5,
  },
});



