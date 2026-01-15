import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import OnboardingProgress from '../components/OnboardingProgress';

export default function ImpactScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const impacts = [
        "40% fewer dating matches",
        "Overlooked for high-value groups",
        "Awkward silences in every talk",
        "Dread for social gatherings",
        "Zero influence on peer decisions",
    ];

    useEffect(() => {
        // Trigger haptics for each item appearance
        impacts.forEach((_, index) => {
            setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 600 + (index * 600)); // Sync with animation delay
        });
    }, []);

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/projection',
            params: { ...params }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={[COLORS.background, '#0f0f1a']} style={StyleSheet.absoluteFill} />

            {/* ProgressBar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowRight size={24} color={COLORS.textDim} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <OnboardingProgress
                    currentStep={2}
                    totalSteps={3}
                    style={{ flex: 1, marginHorizontal: 16 }}
                    width="auto"
                />
                <View style={styles.langBadge}>
                    <Text style={styles.langText}>EN</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <Text style={styles.title}>
                        What <Text style={{ color: COLORS.textDim }}>low charisma</Text>{'\n'}really costs you.
                    </Text>
                </Animated.View>

                <View style={styles.listContainer}>
                    {impacts.map((impact, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(600 + (index * 600)).springify().damping(12)}
                            style={styles.impactCard}
                        >
                            <AlertCircle size={24} color={COLORS.primary} style={styles.icon} />
                            <Text style={styles.impactText}>{impact}</Text>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <Animated.View entering={FadeInUp.delay(1000)} style={styles.footer}>
                <TouchableOpacity
                    style={styles.buttonWrapper}
                    onPress={handleNext}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={COLORS.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Next</Text>
                    </LinearGradient>
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
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        marginBottom: SPACING.l,
    },
    backButton: {
        padding: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: COLORS.surfaceLight,
        marginHorizontal: 16,
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    langBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
    },
    langText: {
        color: COLORS.text,
        fontSize: 12,
        fontFamily: FONTS.bodyBold,
    },
    content: {
        paddingHorizontal: SPACING.l,
        paddingBottom: 100,
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.display,
        color: COLORS.text,
        marginBottom: SPACING.xl,
        lineHeight: 40,
    },
    listContainer: {
        gap: 12,
    },
    impactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(29, 23, 48, 0.8)', // Dark purple tint
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(108, 92, 231, 0.1)',
    },
    icon: {
        marginRight: 16,
    },
    impactText: {
        fontSize: 16,
        fontFamily: FONTS.bodyMedium,
        color: COLORS.text, // Purple tint
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.l,
        paddingBottom: SPACING.xl,
    },
    buttonWrapper: {
        width: '100%',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        borderRadius: 30,
    },
    button: {
        paddingVertical: 18,
        borderRadius: 30,
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
