import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import OnboardingProgress from '../components/OnboardingProgress';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;
const STROKE_WIDTH = 20;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function TimeInvestmentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [minutes, setMinutes] = useState(15);

    // Animation for circle
    const progress = useSharedValue(15 / 120);

    const handleValueChange = (val: number) => {
        const steppedVal = Math.round(val);
        if (steppedVal !== minutes) {
            setMinutes(steppedVal);
            progress.value = steppedVal / 120;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleContinue = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/assessment-ready',
            params: { ...params, timeInvestment: minutes }
        });
    };

    const animatedProps = useAnimatedStyle(() => {
        const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progress.value);
        return {
            strokeDashoffset,
        };
    });

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, '#1a1a2e']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                {/* Visual progress bar matching Impact screen */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '80%' }]} />
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.nonScrollContent}>
                    <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                        <Text style={styles.title}>Daily Commitment</Text>
                        <Text style={styles.subtitle}>
                            How much time can you dedicate to your charisma practice?
                        </Text>
                    </Animated.View>

                    {/* Circular Dial - Moved higher */}
                    <View style={styles.dialContainer}>
                        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                            <Defs>
                                <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                    <Stop offset="0" stopColor="#A020F0" stopOpacity="1" />
                                    <Stop offset="1" stopColor={COLORS.primary} stopOpacity="1" />
                                </SvgLinearGradient>
                            </Defs>

                            {/* Track */}
                            <Circle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={RADIUS}
                                stroke={COLORS.surfaceLight}
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                                strokeDasharray="10, 10"
                            />

                            {/* Progress */}
                            <AnimatedCircle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={RADIUS}
                                stroke="url(#grad)"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                                animatedProps={animatedProps as any}
                            />
                        </Svg>

                        <View style={styles.centerTextContainer}>
                            <Text style={styles.minutesText}>{minutes}m</Text>
                        </View>
                    </View>

                    {/* Slider */}
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={5}
                            maximumValue={120}
                            step={5}
                            minimumTrackTintColor={COLORS.primary}
                            maximumTrackTintColor={COLORS.surfaceLight}
                            thumbTintColor="#fff"
                            value={minutes}
                            onValueChange={handleValueChange}
                        />
                    </View>
                </View>

                <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={COLORS.primaryGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Next</Text>
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
    contentContainer: {
        flex: 1,
    },
    nonScrollContent: {
        flex: 1,
        // Removed paddingHorizontal to remove side borders
        alignItems: 'center',
        paddingTop: 70, // Reduced further to bring it near nav bar
    },
    header: {
        width: '100%',
        marginBottom: SPACING.l, // Reduced from SPACING.xl
        alignItems: 'center', // Center align text
    },
    title: {
        fontSize: 28,
        fontFamily: FONTS.display,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        textAlign: 'center',
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: SPACING.l, // Keep text readable
    },
    dialContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l, // Reduced from xl to bring slider up
        marginTop: SPACING.s,
    },
    centerTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    minutesText: {
        fontSize: 56,
        fontFamily: FONTS.display,
        color: '#fff',
    },
    sliderContainer: {
        width: '100%',
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.xxl,
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
    buttonGradient: {
        paddingVertical: 18,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.text,
        fontSize: 18,
        fontFamily: FONTS.bodyBold,
    },
});
