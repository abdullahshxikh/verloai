import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Image, ActivityIndicator, Animated, Dimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, LogOut, ChevronRight, Camera, X, Crown, Flame, Target, Trophy, TrendingUp, UserCircle, Mail, Heart, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect, useMemo } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useAuth } from '../../lib/AuthProvider';
import { useProgress } from '../../lib/ProgressProvider';
import { useRevenueCat } from '../../lib/RevenueCatProvider';

const { width: SCREEN_W } = Dimensions.get('window');
const isSmall = SCREEN_W < 380;
const GRAPH_WIDTH = SCREEN_W - SPACING.l * 2 - 32;
const GRAPH_HEIGHT = isSmall ? 130 : 160;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { streak, xp, charismaScore, completedLevels, avatarUrl, fullName, updateProfile, charismaHistory, loadCharismaHistory, datingAvatarPreference, updateDatingPreference } = useProgress();
  const { isProMember } = useRevenueCat();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(fullName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [editGender, setEditGender] = useState<string | null>(null);
  const [editDatingPref, setEditDatingPref] = useState<'men' | 'women' | 'auto' | null>(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCharismaHistory();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Build graph data - ONLY use real history data, no mock/seed data
  const graphData = useMemo(() => {
    if (charismaHistory.length >= 2) {
      return charismaHistory.map(h => h.score);
    }
    return [];
  }, [charismaHistory]);

  const graphPath = useMemo(() => {
    if (graphData.length < 2) return null;
    const minScore = Math.max(0, Math.min(...graphData) - 5);
    const maxScore = Math.max(...graphData) + 5;
    const range = maxScore - minScore || 1;
    const padding = { top: 10, bottom: 30, left: 0, right: 0 };
    const chartW = GRAPH_WIDTH - padding.left - padding.right;
    const chartH = GRAPH_HEIGHT - padding.top - padding.bottom;

    const points = graphData.map((score, i) => ({
      x: padding.left + (i / (graphData.length - 1)) * chartW,
      y: padding.top + chartH - ((score - minScore) / range) * chartH,
    }));

    // Smooth bezier curve through points
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
      const cpy1 = prev.y;
      const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
      const cpy2 = curr.y;
      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
    }

    // Area fill path (close to bottom)
    const areaPath = path +
      ` L ${points[points.length - 1].x} ${GRAPH_HEIGHT}` +
      ` L ${points[0].x} ${GRAPH_HEIGHT} Z`;

    return { line: path, area: areaPath, points, minScore, maxScore };
  }, [graphData]);

  const graphLabels = useMemo(() => {
    if (charismaHistory.length >= 2) {
      const step = Math.max(1, Math.floor(charismaHistory.length / 4));
      return charismaHistory
        .filter((_, i) => i % step === 0 || i === charismaHistory.length - 1)
        .map(h => {
          const d = new Date(h.recorded_at);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        });
    }
    return [];
  }, [charismaHistory]);

  const startEditing = async () => {
    setEditName(fullName || user?.user_metadata?.full_name || '');
    setEditDatingPref(datingAvatarPreference);
    try {
      const savedGender = await AsyncStorage.getItem('user_gender');
      setEditGender(savedGender);
    } catch {
      setEditGender(null);
    }
    setIsEditing(true);
  };

  const saveProfile = async () => {
    setIsLoading(true);
    await updateProfile({ fullName: editName });
    if (editGender) {
      await AsyncStorage.setItem('user_gender', editGender);
    }
    if (editDatingPref) {
      await updateDatingPreference(editDatingPref);
    }
    setIsLoading(false);
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsLoading(true);
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateProfile({ avatarUrl: base64Img });
        setIsLoading(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive", onPress: async () => {
          await signOut();
          router.replace('/auth/signin');
        }
      }
    ]);
  };

  const displayName = fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User';
  const initials = displayName.substring(0, 2).toUpperCase();

  // Resolve avatar: custom upload > Google profile picture > initials
  const resolvedAvatarUrl = avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F11', '#1a1a2e', '#0F0F11']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Hero Profile Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          {/* Avatar */}
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.primary, '#a363d9', COLORS.secondary]}
              style={styles.avatarGradientRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {resolvedAvatarUrl ? (
                <Image source={{ uri: resolvedAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </LinearGradient>
            <View style={styles.cameraButton}>
              <Camera size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Name & Edit */}
          <TouchableOpacity style={styles.nameContainer} onPress={startEditing}>
            <Text style={styles.userName}>{displayName}</Text>
          </TouchableOpacity>

          <Text style={styles.userEmail}>{user?.email || 'Not signed in'}</Text>

          {/* Pro Badge */}
          {isProMember && (
            <View style={styles.proBadgeContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.proBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={12} color="#000" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </LinearGradient>
            </View>
          )}
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(108, 92, 231, 0.12)', 'rgba(108, 92, 231, 0.04)']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Trophy size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{charismaScore}</Text>
              <Text style={styles.statLabel}>High Score</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(253, 203, 110, 0.12)', 'rgba(253, 203, 110, 0.04)']}
              style={styles.statGradient}
            >
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(253, 203, 110, 0.2)' }]}>
                <Flame size={18} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(0, 206, 201, 0.12)', 'rgba(0, 206, 201, 0.04)']}
              style={styles.statGradient}
            >
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 206, 201, 0.2)' }]}>
                <Target size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>{completedLevels.length}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuCard}>
          {/* Edit Profile */}
          <TouchableOpacity style={styles.menuRow} onPress={startEditing}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(108, 92, 231, 0.15)' }]}>
                <UserCircle size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textDim} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Contact Support */}
          <TouchableOpacity style={styles.menuRow} onPress={() => Linking.openURL('https://verloai.vercel.app/contact')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(253, 203, 110, 0.15)' }]}>
                <Mail size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.menuLabel}>Contact Support</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textDim} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Privacy Policy */}
          <TouchableOpacity style={styles.menuRow} onPress={() => Linking.openURL('https://verloai.vercel.app/privacy-policy')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
                <Shield size={20} color={COLORS.textDim} />
              </View>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textDim} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Terms of Service */}
          <TouchableOpacity style={styles.menuRow} onPress={() => Linking.openURL('https://verloai.vercel.app/terms')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
                <FileText size={20} color={COLORS.textDim} />
              </View>
              <Text style={styles.menuLabel}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textDim} />
          </TouchableOpacity>
        </View>

        {/* Charisma Growth Graph - At Bottom, ONLY real data */}
        {graphPath && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <TrendingUp size={18} color={COLORS.success} />
                <Text style={styles.sectionTitle}>Charisma Growth</Text>
              </View>
              {graphData.length >= 2 && (
                <View style={styles.graphBadge}>
                  <TrendingUp size={12} color={COLORS.success} />
                  <Text style={styles.graphBadgeText}>
                    +{Math.max(0, graphData[graphData.length - 1] - graphData[0])} pts
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.graphCard}>
              <LinearGradient
                colors={['rgba(85, 239, 196, 0.06)', 'rgba(108, 92, 231, 0.03)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
                <Defs>
                  <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={COLORS.success} stopOpacity="0.3" />
                    <Stop offset="1" stopColor={COLORS.success} stopOpacity="0.0" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.8" />
                    <Stop offset="1" stopColor={COLORS.success} stopOpacity="1" />
                  </SvgLinearGradient>
                </Defs>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((pct, i) => (
                  <Line
                    key={i}
                    x1={0}
                    y1={10 + (GRAPH_HEIGHT - 40) * pct}
                    x2={GRAPH_WIDTH}
                    y2={10 + (GRAPH_HEIGHT - 40) * pct}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={1}
                  />
                ))}
                {/* Area fill */}
                <Path d={graphPath.area} fill="url(#areaGrad)" />
                {/* Line */}
                <Path
                  d={graphPath.line}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Current point glow */}
                {graphPath.points.length > 0 && (
                  <>
                    <Circle
                      cx={graphPath.points[graphPath.points.length - 1].x}
                      cy={graphPath.points[graphPath.points.length - 1].y}
                      r={6}
                      fill={COLORS.success}
                      opacity={0.3}
                    />
                    <Circle
                      cx={graphPath.points[graphPath.points.length - 1].x}
                      cy={graphPath.points[graphPath.points.length - 1].y}
                      r={3.5}
                      fill={COLORS.success}
                    />
                  </>
                )}
              </Svg>
              {/* Labels row */}
              <View style={styles.graphLabelsRow}>
                {graphLabels.map((label, i) => (
                  <Text key={i} style={styles.graphLabel}>{label}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* No data state for graph */}
        {!graphPath && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <TrendingUp size={18} color={COLORS.success} />
                <Text style={styles.sectionTitle}>Charisma Growth</Text>
              </View>
            </View>
            <View style={styles.emptyGraphCard}>
              <TrendingUp size={32} color={COLORS.textDim} />
              <Text style={styles.emptyGraphText}>Complete at least 2 sessions to see your growth chart</Text>
            </View>
          </View>
        )}

        {/* Logout Button */}
        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/signin')}
          >
            <User size={20} color={COLORS.primary} />
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Version 1.0.1 (Build 43)</Text>

      </Animated.ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={isEditing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.modalCloseButton}>
                <X size={24} color={COLORS.textDim} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textDim}
              autoFocus
            />

            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.optionGroup}>
              {['Woman', 'Man', 'Non-binary', 'Prefer not to say'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, editGender === g && styles.optionButtonActive]}
                  onPress={() => setEditGender(g)}
                >
                  <Text style={[styles.optionText, editGender === g && styles.optionTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Dating Preference</Text>
            <View style={styles.optionGroup}>
              <TouchableOpacity
                style={[styles.optionButton, editDatingPref === 'women' && styles.optionButtonActive]}
                onPress={() => setEditDatingPref('women')}
              >
                <Heart size={14} color={editDatingPref === 'women' ? COLORS.text : COLORS.textDim} />
                <Text style={[styles.optionText, editDatingPref === 'women' && styles.optionTextActive]}>Practice with Women</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, editDatingPref === 'men' && styles.optionButtonActive]}
                onPress={() => setEditDatingPref('men')}
              >
                <User size={14} color={editDatingPref === 'men' ? COLORS.text : COLORS.textDim} />
                <Text style={[styles.optionText, editDatingPref === 'men' && styles.optionTextActive]}>Practice with Men</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveProfile}
              disabled={isLoading}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.display,
    color: COLORS.text,
    textAlign: 'center',
    paddingTop: SPACING.m,
    paddingBottom: SPACING.s,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: SPACING.m,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.l,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.m,
  },
  avatarGradientRing: {
    width: isSmall ? 90 : 110,
    height: isSmall ? 90 : 110,
    borderRadius: isSmall ? 45 : 55,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: isSmall ? 80 : 100,
    height: isSmall ? 80 : 100,
    borderRadius: isSmall ? 40 : 50,
    backgroundColor: COLORS.surface,
  },
  avatarPlaceholder: {
    width: isSmall ? 80 : 100,
    height: isSmall ? 80 : 100,
    borderRadius: isSmall ? 40 : 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 32,
    fontFamily: FONTS.displaySemi,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: isSmall ? 22 : 26,
    fontFamily: FONTS.display,
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginBottom: SPACING.s,
  },
  proBadgeContainer: {
    marginTop: SPACING.s,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  proBadgeText: {
    color: '#000',
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.l,
    gap: 10,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: isSmall ? 18 : 22,
    fontFamily: FONTS.display,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
    marginTop: 2,
    textAlign: 'center',
  },
  menuCard: {
    marginHorizontal: SPACING.l,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.xl,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: SPACING.m,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: SPACING.m,
  },
  section: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
  },
  graphCard: {
    borderRadius: 20,
    padding: SPACING.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(85, 239, 196, 0.15)',
    alignItems: 'center',
  },
  graphBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(85, 239, 196, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  graphBadgeText: {
    color: COLORS.success,
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
  },
  graphLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GRAPH_WIDTH,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  graphLabel: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    opacity: 0.6,
  },
  emptyGraphCard: {
    borderRadius: 20,
    padding: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyGraphText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    marginHorizontal: SPACING.l,
    backgroundColor: 'rgba(255, 118, 117, 0.1)',
    borderRadius: 16,
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 117, 0.2)',
    gap: 8,
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
    padding: SPACING.m,
    marginHorizontal: SPACING.l,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 16,
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    gap: 8,
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
    marginBottom: SPACING.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: SPACING.l,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: FONTS.display,
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textDim,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 16,
    color: COLORS.text,
    fontFamily: FONTS.body,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    overflow: 'hidden',
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  optionText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
  },
  optionTextActive: {
    color: COLORS.text,
  },
});
