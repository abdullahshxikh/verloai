import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, UserX, Trash2, HardDrive, Check, Lock, ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import OnboardingProgress from '../components/OnboardingProgress';

export default function ConsentScreen() {
  const router = useRouter();
  const [dontStoreAudio, setDontStoreAudio] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <OnboardingProgress currentStep={2} totalSteps={7} />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <View style={styles.iconCircle}>
            <Lock size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Privacy First</Text>
          <Text style={styles.subtitle}>
            We value your privacy and trust. Here is how we handle your data.
          </Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.features} showsVerticalScrollIndicator={false}>
          {[
            {
              icon: ShieldCheck,
              title: "Scoring & Coaching Only",
              desc: "Your voice is analyzed solely to give you feedback.",
              color: COLORS.success
            },
            {
              icon: Trash2,
              title: "Delete Anytime",
              desc: "You have full control to wipe your data instantly.",
              color: COLORS.error
            },
            {
              icon: UserX,
              title: "No Impersonation",
              desc: "We never clone your voice or use it for identity.",
              color: COLORS.accent
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(400 + (index * 100)).springify()}
                style={styles.featureRow}
              >
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <Icon size={24} color={item.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDescription}>{item.desc}</Text>
                </View>
              </Animated.View>
            );
          })}

          <Animated.View entering={FadeInDown.delay(700).springify()}>
            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.toggleRow, dontStoreAudio && styles.activeToggle]}
              activeOpacity={1}
              onPress={() => setDontStoreAudio(!dontStoreAudio)}
            >
              <View style={styles.toggleInfo}>
                <View style={styles.toggleHeader}>
                  <HardDrive size={20} color={dontStoreAudio ? COLORS.text : COLORS.textDim} style={{ marginRight: 8 }} />
                  <Text style={[styles.toggleLabel, dontStoreAudio && { color: COLORS.text }]}>Don't store audio</Text>
                </View>
                <Text style={styles.toggleDescription}>Store transcript & scores only.</Text>
              </View>
              <Switch
                value={dontStoreAudio}
                onValueChange={setDontStoreAudio}
                trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                thumbColor={COLORS.text}
                ios_backgroundColor={COLORS.surfaceLight}
              />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        <Animated.View entering={FadeInUp.delay(900).springify()} style={styles.footer}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push('/goal')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>I understand, continue</Text>
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
    paddingHorizontal: SPACING.l,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 24,
    textAlign: 'center',
  },
  features: {
    paddingBottom: 160, // Increased to ensure button doesn't overlap content
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.l,
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  featureText: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.m,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  activeToggle: {
    borderColor: 'rgba(108, 92, 231, 0.3)',
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
  },
  toggleInfo: {
    flex: 1,
    paddingRight: SPACING.m,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
  },
  toggleDescription: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginLeft: 28,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.l,
    right: SPACING.l,
    paddingBottom: 0,
  },
  buttonWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    minHeight: 56, // Ensures consistent button height
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
  },
});
