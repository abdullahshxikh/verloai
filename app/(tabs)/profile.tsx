import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, LogOut, ChevronRight, CreditCard, Award, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useAuth } from '../../lib/AuthProvider';
import { useOnboarding } from '../../lib/OnboardingProvider';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive", onPress: async () => {
          await signOut();
          router.replace('/auth/signin');
        }
      }
    ]);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will clear onboarding state and restart the app flow.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset", style: "destructive", onPress: async () => {
            try {
              // Reset onboarding state using context
              await resetOnboarding();
              // Sign out if authenticated
              if (user) {
                await signOut();
              }
              // Navigate to root
              router.replace('/');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('Error', 'Failed to reset onboarding. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert("Delete Data", "This will wipe your scores and recordings. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive" }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROFILE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <LinearGradient
              colors={COLORS.accentGradient}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.avatarText}>
              {user?.email?.substring(0, 2).toUpperCase() || 'GU'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.user_metadata?.full_name || user?.email || 'Guest User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'Not signed in'}
            </Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>62</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/paywall')}>
            <View style={styles.rowLeft}>
              <CreditCard size={20} color={COLORS.text} />
              <Text style={styles.rowLabel}>Current Plan</Text>
            </View>
            <View style={styles.rowRight}>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>Basic</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textDim} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={20} color={COLORS.text} />
              <Text style={styles.rowLabel}>Daily Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </View>

          <TouchableOpacity style={styles.row} onPress={handleDeleteData}>
            <View style={styles.rowLeft}>
              <Shield size={20} color={COLORS.text} />
              <Text style={styles.rowLabel}>Privacy & Data</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textDim} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handleResetOnboarding}>
            <View style={styles.rowLeft}>
              <RotateCcw size={20} color={COLORS.secondary} />
              <Text style={styles.rowLabel}>Reset Onboarding (Dev)</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textDim} />
          </TouchableOpacity>
        </View>

        {/* Auth Action */}
        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.error} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/signin')}
          >
            <User size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Version 1.0.0 (Build 42)</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    letterSpacing: 1.5,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statBox: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
    marginLeft: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  planText: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 118, 117, 0.1)',
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 117, 0.2)',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.error,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  signInText: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.primary,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 12,
    fontFamily: FONTS.body,
    opacity: 0.5,
  },
});
