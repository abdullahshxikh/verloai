import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useOnboarding } from '../lib/OnboardingProvider';
import { useRevenueCat } from '../lib/RevenueCatProvider';

export default function PaywallScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const { offerings, isProMember, purchasePackage, restorePurchases, loading: rcLoading, showPaywall } = useRevenueCat();
  // Optional: Select a specific offering (e.g. for experiments or placements)
  // const offering = offerings?.all['experiment_group'] || offerings?.current;
  const offering = offerings?.current;
  const [purchasing, setPurchasing] = useState(false);

  // Auto-select monthly as default (best value for the user)
  const availablePackages = offering?.availablePackages || [];
  const [selectedPackage, setSelectedPackage] = useState<string>(
    availablePackages.find(p => p.identifier === '$rc_monthly')?.identifier ||
    availablePackages[0]?.identifier || '$rc_monthly'
  );

  const features = [
    { text: "Unlimited AI conversations", pro: true },
    { text: "Advanced scenarios (Conflict, Dating)", pro: true },
    { text: "Deep skill breakdown & drills", pro: true },
    { text: "Personalized AI coaching", pro: true },
    { text: "Priority support", pro: true },
  ];

  // Helper: get human-readable period label
  const getPackagePeriod = (identifier: string) => {
    switch (identifier) {
      case '$rc_weekly': return '/ year';
      case '$rc_monthly': return '/ month';
      case '$rc_annual': return '/ year';
      case '$rc_lifetime': return 'one-time';
      default: return '';
    }
  };

  // Use RevenueCat's native paywall UI
  const handleShowNativePaywall = async () => {
    try {
      await showPaywall();
      // After paywall dismissal, check if user is now pro
      if (isProMember) {
        await completeOnboarding();
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Paywall error:', error);
    }
  };

  // Manual purchase flow (alternative to native paywall)
  const handlePurchase = async () => {
    if (!offering?.availablePackages) {
      Alert.alert('Error', 'No subscription options available');
      return;
    }

    // Find the selected package (match by identifier like $rc_monthly)
    const pkg = offering.availablePackages.find(
      p => p.identifier === selectedPackage
    );

    if (!pkg) {
      Alert.alert('Error', 'Selected package not found');
      return;
    }

    setPurchasing(true);
    const { customerInfo, error, userCancelled } = await purchasePackage(pkg);
    setPurchasing(false);

    if (userCancelled) {
      return;
    }

    if (error) {
      Alert.alert('Purchase Failed', error.message || 'Something went wrong');
      return;
    }

    // Strictly check for entitlement active status as per rules
    if (customerInfo?.entitlements.active['Verlo ai Pro']) {
      Alert.alert(
        'Success!',
        'Welcome to Verlo AI Pro! 🎉',
        [
          {
            text: 'Get Started',
            onPress: async () => {
              await completeOnboarding();
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } else {
      // Fallback if purchase succeeded but entitlement is missing (rare)
      Alert.alert('Purchase Successful', 'Your purchase was successful but we could not verify your Pro status. Please try restoring purchases.');
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const { customerInfo: restoredInfo, error } = await restorePurchases();
    setPurchasing(false);

    if (error) {
      Alert.alert('Restore Failed', 'No purchases found to restore');
      return;
    }

    if (restoredInfo) {
      // Check the returned customerInfo directly instead of stale isProMember state
      const hasPro = typeof restoredInfo.entitlements.active['Verlo ai Pro'] !== 'undefined';
      if (hasPro) {
        Alert.alert('Restored!', 'Your purchases have been restored', [
          {
            text: 'Continue',
            onPress: async () => {
              await completeOnboarding();
              router.replace('/(tabs)');
            },
          },
        ]);
      } else {
        Alert.alert('No Active Subscription', 'No active Pro subscription was found to restore.');
      }
    }
  };

  // Get package details from RevenueCat
  const getPackagePrice = (identifier: string) => {
    const pkg = offering?.availablePackages?.find(p => p.identifier === identifier);
    return pkg?.product.priceString || '$30.00';
  };

  const getPackageDescription = (identifier: string) => {
    const pkg = offering?.availablePackages?.find(p => p.identifier === identifier);
    return pkg?.product.introPrice?.priceString ? 'First 7 days free' : '';
  };

  if (rcLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading subscription options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Crown size={48} color={COLORS.primary} fill={COLORS.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.headerTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.headerSubtitle}>
            Join thousands improving their charisma with Verlo AI Pro
          </Text>
        </View>

        {/* Subscription Packages */}
        {availablePackages.length > 0 ? (
          <View style={styles.packagesContainer}>
            {availablePackages.map((pkg, index) => {
              const isSelected = selectedPackage === pkg.identifier;
              const isPopular = pkg.identifier === '$rc_monthly';
              const isYearly = pkg.identifier === '$rc_weekly';

              // Display "Yearly" for the weekly package slot
              const displayTitle = isYearly
                ? 'Yearly'
                : (pkg.product.title || pkg.identifier.replace('$rc_', '').charAt(0).toUpperCase() + pkg.identifier.replace('$rc_', '').slice(1));

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                  onPress={() => setSelectedPackage(pkg.identifier)}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>BEST VALUE</Text>
                    </View>
                  )}
                  {isYearly && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>60% OFF</Text>
                    </View>
                  )}
                  <View style={styles.packageHeader}>
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageTitle}>{displayTitle}</Text>
                      <Text style={styles.packagePrice}>
                        {pkg.product.priceString} {getPackagePeriod(pkg.identifier)}
                      </Text>
                      {pkg.product.introPrice && (
                        <Text style={styles.packageTrial}>
                          {pkg.product.introPrice.priceString} for {pkg.product.introPrice.period}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          // Fallback UI if offerings aren't loaded
          <View style={styles.proCard}>
            <LinearGradient
              colors={[COLORS.surfaceLight, COLORS.surface]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.proHeader}>
              <Text style={styles.proLabel}>VERLO AI PRO</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>RECOMMENDED</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>$30.00 / month</Text>
              <Text style={styles.trialText}>First 7 days free</Text>
            </View>
          </View>
        )}

        {/* Features List */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What's Included:</Text>
          <View style={styles.featureList}>
            {features.filter(f => f.pro).map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Check size={20} color={COLORS.primary} strokeWidth={3} style={{ marginRight: 12 }} />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Restore Purchases Link */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        {/* Subscribe Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handlePurchase}
          disabled={purchasing || !offerings}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Subscribe Now</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Cancel anytime. Terms apply.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl,
    paddingBottom: 200,
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
  packagesContainer: {
    marginBottom: SPACING.l,
  },
  packageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    color: COLORS.background,
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  packageTrial: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.accent,
    marginTop: 2,
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
  featuresCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: SPACING.l,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
    flex: 1,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.l,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background,
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
  disclaimerText: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
    opacity: 0.7,
  },
});
