import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useOnboarding } from '../lib/OnboardingProvider';

export default function PaywallScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const features = [
    { text: "Unlimited Verlo conversations", free: false, pro: true },
    { text: "Advanced scenarios (Conflict, Dating)", free: false, pro: true },
    { text: "Deep skill breakdown & drills", free: false, pro: true },
    { text: "Personalized 'Verlo Plan'", free: false, pro: true },
    { text: "1 Daily Challenge", free: true, pro: true },
    { text: "Weekly Re-score", free: true, pro: true },
  ];

  const handleContinue = async () => {
    // If user is already authenticated (e.g. came from projection -> signup -> paywall),
    // mark onboarding as complete and go to tabs.
    // Otherwise, send to signup first.

    // For now, simpler flow: everyone goes to Signup after Paywall (which is standard for "Free Trial" CTA)
    // But based on our flow, they came from Projection -> Signup -> Paywall.
    // So they are LIKELY authenticated.

    // If we came with levelId=0 (assessment) and maybe completed it? 
    // Actually, usually we might award XP for completing onboarding.
    // Let's just complete onboarding.

    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reach your potential.</Text>
          <Text style={styles.headerSubtitle}>
            Most users see a 15% score increase in the first week with Pro.
          </Text>
        </View>

        {/* Pro Card */}
        <View style={styles.proCard}>
          <LinearGradient
            colors={[COLORS.surfaceLight, COLORS.surface]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.proHeader}>
            <Text style={styles.proLabel}>CHARISMA PRO</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>RECOMMENDED</Text>
            </View>
          </View>

          <View style={styles.featureList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.iconContainer}>
                  {feature.pro ? (
                    <Check size={18} color={COLORS.primary} strokeWidth={3} />
                  ) : (
                    <View style={styles.bullet} />
                  )}
                </View>
                <Text style={[styles.featureText, { opacity: feature.pro ? 1 : 0.5 }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>$29.99 / month</Text>
            <Text style={styles.trialText}>First 7 days free</Text>
          </View>
        </View>

        {/* Free Option */}
        <View style={styles.freeContainer}>
          <Text style={styles.freeTitle}>Basic Access</Text>
          <Text style={styles.freeText}>
            1 daily challenge • Weekly score update
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Start 7-Day Free Trial</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleContinue}
        >
          <Text style={styles.secondaryButtonText}>Continue with Basic Access</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl,
    paddingBottom: 160,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.s,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 24,
  },
  proCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.l,
    overflow: 'hidden',
  },
  proHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  proLabel: {
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
  },
  featureList: {
    marginBottom: SPACING.l,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLight,
  },
  featureText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
  },
  priceContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 4,
  },
  trialText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  freeContainer: {
    alignItems: 'center',
  },
  freeTitle: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    marginBottom: 4,
  },
  freeText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.l,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background, // Opaque to hide scroll content behind
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
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
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textDim,
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
  },
});
