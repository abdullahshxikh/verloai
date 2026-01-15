import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import OnboardingProgress from '../components/OnboardingProgress';

export default function GenderScreen() {
    const router = useRouter();
    const [selectedGender, setSelectedGender] = useState<string | null>(null);

    const genders = [
        "Woman",
        "Man",
        "Non-binary",
        "Prefer not to say"
    ];

    const handleSelect = async (gender: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedGender(gender);
        try {
            await AsyncStorage.setItem('user_gender', gender);
        } catch (e) {
            console.error('Failed to save gender', e);
        }
    };

    const handleContinue = () => {
        if (selectedGender) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/consent'); // Proceed to consent
        }
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
                <OnboardingProgress currentStep={1} totalSteps={5} width="80%" />
            </View>

            <View style={styles.content}>
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                    <Text style={styles.title}>How do you identify?</Text>
                    <Text style={styles.subtitle}>
                        We use this to personalize your coaching experience.
                    </Text>
                </Animated.View>

                <ScrollView contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                    {genders.map((gender, index) => {
                        const isSelected = selectedGender === gender;
                        return (
                            <Animated.View
                                key={gender}
                                entering={FadeInDown.delay(300 + (index * 100)).springify()}
                                style={styles.optionWrapper}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        isSelected && styles.optionSelected
                                    ]}
                                    onPress={() => handleSelect(gender)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {gender}
                                    </Text>
                                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, !selectedGender && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!selectedGender}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={selectedGender ? COLORS.primaryGradient : (['#333', '#333'] as const)}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={[styles.buttonText, !selectedGender && { color: '#666' }]}>Continue</Text>
                            {selectedGender && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
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
        paddingHorizontal: 0, // Removed side borders
    },
    header: {
        paddingTop: 120, // Kept high to clear nav
        paddingBottom: SPACING.xl,
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
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
        textAlign: 'center',
    },
    optionsContainer: {
        paddingBottom: 100,
        gap: 12,
        paddingHorizontal: SPACING.s,
    },
    optionWrapper: {
        width: '100%',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    optionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
    },
    optionText: {
        fontSize: 18,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
    },
    optionTextSelected: {
        color: COLORS.text,
        fontFamily: FONTS.bodyBold,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    radioInner: {
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
