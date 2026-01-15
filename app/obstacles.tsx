import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Battery, Cloud, Clock, AlertCircle, Smartphone, MessageCircle, Frown, MicOff, ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import OnboardingProgress from '../components/OnboardingProgress';


export default function ObstaclesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedObstacles, setSelectedObstacles] = useState<string[]>([]);

  const obstacles = [
    {
      id: 'anxiety',
      title: 'Social Anxiety',
      icon: AlertCircle,
    },
    {
      id: 'blank',
      title: 'Running out of things to say',
      icon: MessageCircle,
    },
    {
      id: 'rejection',
      title: 'Fear of Rejection',
      icon: Frown,
    },
    {
      id: 'voice',
      title: 'Monotone Voice',
      icon: MicOff,
    },
    {
      id: 'confidence',
      title: 'Low Confidence',
      icon: Battery,
    },
    {
      id: 'procrastination',
      title: 'Procrastinating Practice',
      icon: Clock,
    },
  ];

  const toggleSelection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedObstacles(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/time-investment',
      params: { ...params, obstacles: JSON.stringify(selectedObstacles) }
    });
  };


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#1a1a2e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <OnboardingProgress currentStep={2} totalSteps={3} />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <Text style={styles.title}>What's holding you back?</Text>
          <Text style={styles.subtitle}>
            Select all that apply
          </Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {obstacles.map((item, index) => {
            const isSelected = selectedObstacles.includes(item.id);
            const Icon = item.icon;

            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(300 + (index * 50)).springify()}
                style={styles.cardContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected
                  ]}
                  onPress={() => toggleSelection(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardInner}>
                    <View style={[styles.iconBox, isSelected && { backgroundColor: COLORS.primary }]}>
                      <Icon size={24} color={isSelected ? '#fff' : COLORS.textDim} />
                    </View>

                    <Text style={[styles.cardTitle, isSelected && { color: COLORS.text }]}>
                      {item.title}
                    </Text>

                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <View style={styles.checkboxInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, selectedObstacles.length === 0 && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={selectedObstacles.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedObstacles.length > 0 ? COLORS.primaryGradient : (['#333', '#333'] as const)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={[styles.buttonText, selectedObstacles.length === 0 && { color: '#666' }]}>
                Continue
              </Text>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.l,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 5,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0, // Removed side borders as requested
  },
  header: {
    paddingTop: 80, // Reduced to bring content up near nav bar
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.l, // Keep text validly padded
  },
  title: {
    fontSize: 28, // Slightly smaller to fit "What's holding you back?"
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.s,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  optionsContainer: {
    paddingBottom: 100,
    paddingHorizontal: SPACING.s, // Small padding for cards
  },
  cardContainer: {
    marginBottom: SPACING.m,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    // Removed borderWidth as requested
    overflow: 'hidden',
    padding: SPACING.m,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.l,
    right: SPACING.l,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 30,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
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
  },
});





