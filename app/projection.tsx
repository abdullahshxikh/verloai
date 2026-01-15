import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, CheckCircle, ArrowRight, Clock } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { CharismaAnalysis } from '../services/openai';

export default function ProjectionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    let score = 62;
    let timeInvestment = 10;

    try {
        if (params.result) {
            const result: CharismaAnalysis = JSON.parse(params.result as string);
            if (result.charismaScore) score = result.charismaScore;
        }
        if (params.timeInvestment) {
            timeInvestment = parseInt(params.timeInvestment as string, 10);
        }
    } catch (e) {
        console.log("Error parsing params", e);
    }

    // Logic for projection
    const projectedScore = Math.min(100, score + (timeInvestment * 1.5) + 10);
    const improvement = Math.round(projectedScore - score);

    const benefits = [
        "Command respect in every meeting",
        "Feel completely at ease on dates",
        "Captivate any room you walk into",
        "Negotiate with unshakable confidence"
    ];

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={[COLORS.background, '#1a1a2e']} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                    <Text style={styles.title}>Your Potential</Text>
                    <Text style={styles.subtitle}>Based on your baseline and commitment.</Text>
                </Animated.View>

                {/* Graph/Visual Representation */}
                <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.projectionCard}>
                    <View style={styles.timeBadge}>
                        <Clock size={14} color={COLORS.textDim} style={{ marginRight: 6 }} />
                        <Text style={styles.timeText}>{timeInvestment} mins / day</Text>
                    </View>

                    <View style={styles.scoreRow}>
                        <View style={styles.scoreItem}>
                            <Text style={styles.label}>NOW</Text>
                            <Text style={styles.currentScore}>{score}</Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <TrendingUp size={24} color={COLORS.success} />
                            <Text style={styles.gainText}>+{improvement} pts</Text>
                        </View>

                        <View style={styles.scoreItem}>
                            <Text style={styles.label}>30 DAYS</Text>
                            <Text style={styles.projectedScore}>{Math.round(projectedScore)}</Text>
                        </View>
                    </View>

                    <Text style={styles.projectionNote}>
                        With just {timeInvestment} minutes a day, you're on track to reach the top 3.8% of speakers globally.
                    </Text>
                </Animated.View>

                {/* Benefits List */}
                <View style={styles.benefitsContainer}>
                    <Text style={styles.sectionTitle}>What this means for you:</Text>
                    {benefits.map((benefit, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(600 + (index * 100)).springify()}
                            style={styles.benefitItem}
                        >
                            <CheckCircle size={20} color={COLORS.primary} style={{ marginRight: 12 }} />
                            <Text style={styles.benefitText}>{benefit}</Text>
                        </Animated.View>
                    ))}
                </View>

            </ScrollView>

            {/* Footer */}
            <Animated.View entering={FadeInUp.delay(1000).springify()} style={styles.footer}>
                <TouchableOpacity
                    style={styles.buttonWrapper}
                    onPress={() => router.push({
                        pathname: '/auth/signup',
                        params: { ...params }
                    })}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={COLORS.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Start My Transformation</Text>
                        <ArrowRight size={20} color={COLORS.text} style={{ marginLeft: 8 }} />
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
    scrollContent: {
        paddingHorizontal: SPACING.l,
        paddingBottom: 100,
    },
    header: {
        paddingVertical: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.display,
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        textAlign: 'center',
    },
    projectionCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: SPACING.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.xl,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: SPACING.l,
    },
    timeText: {
        color: COLORS.textDim,
        fontSize: 12,
        fontFamily: FONTS.bodyBold,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    scoreItem: {
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontFamily: FONTS.bodyBold,
        color: COLORS.textDim,
        marginBottom: 8,
        letterSpacing: 1,
    },
    currentScore: {
        fontSize: 48,
        fontFamily: FONTS.display,
        color: COLORS.textDim, // Dimmed to highlight the future
    },
    projectedScore: {
        fontSize: 48,
        fontFamily: FONTS.display,
        color: COLORS.primary, // Highlighted
    },
    arrowContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    gainText: {
        color: COLORS.success,
        fontFamily: FONTS.bodyBold,
        fontSize: 14,
        marginTop: 4,
    },
    projectionNote: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 22,
    },
    benefitsContainer: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.displaySemi,
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: SPACING.s,
    },
    benefitText: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.text,
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: SPACING.l,
        right: SPACING.l,
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
