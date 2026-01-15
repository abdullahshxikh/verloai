import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ArrowRight, Zap, RefreshCw, BarChart2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function ChallengeFeedbackScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <Text style={styles.headerTitle}>SESSION COMPLETE</Text>
        </Animated.View>

        {/* Success Animation Placeholder */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.successContainer}>
          <LinearGradient
            colors={['rgba(85, 239, 196, 0.2)', 'rgba(85, 239, 196, 0)']}
            style={styles.glow}
          />
          <View style={styles.iconCircle}>
            <CheckCircle size={64} color={COLORS.success} />
          </View>
          <Text style={styles.xpText}>+50 XP</Text>
        </Animated.View>

        {/* Feedback Cards */}
        <View style={styles.feedbackSection}>
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Text style={styles.sectionTitle}>Performance</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.feedbackCard}>
            <View style={styles.cardHeader}>
               <BarChart2 size={16} color={COLORS.success} style={{ marginRight: 6 }} />
               <Text style={styles.feedbackLabel}>STRENGTH</Text>
            </View>
            <Text style={styles.feedbackTitle}>Great Pacing</Text>
            <Text style={styles.feedbackDetail}>
              You held a steady 140 wpm. This makes you sound thoughtful and controlled.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).springify()} style={[styles.feedbackCard, { borderLeftColor: COLORS.warning }]}>
            <View style={styles.cardHeader}>
               <Zap size={16} color={COLORS.warning} style={{ marginRight: 6 }} />
               <Text style={[styles.feedbackLabel, { color: COLORS.warning }]}>TO IMPROVE</Text>
            </View>
            <Text style={styles.feedbackTitle}>Watch the Fillers</Text>
            <Text style={styles.feedbackDetail}>
              You used "um" 3 times in the second turn. Try pausing silently instead.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <Animated.View entering={FadeInUp.delay(1000).springify()} style={styles.footer}>
        <TouchableOpacity 
          style={styles.buttonWrapper}
          onPress={() => router.replace('/home')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.replace('/challenge')}
        >
          <RefreshCw size={16} color={COLORS.textDim} style={{ marginRight: 6 }} />
          <Text style={styles.secondaryButtonText}>Retry Session</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 140,
    paddingHorizontal: SPACING.l,
  },
  header: {
    paddingVertical: SPACING.l,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -40,
  },
  iconCircle: {
    marginBottom: SPACING.m,
    transform: [{ scale: 1.2 }],
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  xpText: {
    fontSize: 48,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: -1,
  },
  feedbackSection: {
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  feedbackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  feedbackTitle: {
    fontSize: 18,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 8,
  },
  feedbackDetail: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.l,
    paddingBottom: SPACING.xl,
    backgroundColor: 'rgba(15,15,17,0.9)', 
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.m,
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
  },
  secondaryButton: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textDim,
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
  },
});











