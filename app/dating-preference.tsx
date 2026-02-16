import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Heart, User } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import OnboardingProgress from '../components/OnboardingProgress';

export default function DatingPreferenceScreen() {
    const router = useRouter();
    const [selectedPreference, setSelectedPreference] = useState<string | null>(null);

    const preferences = [
        {
            id: "women",
            label: "Practice with Women",
            description: "Female dating coach for your scenarios",
            icon: Heart,
        },
        {
            id: "men",
            label: "Practice with Men",
            description: "Male dating coach for your scenarios",
            icon: User,
        },
    ];

    const handleSelect = async (preference: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPreference(preference);
        try {
            await AsyncStorage.setItem('dating_avatar_preference', preference);
        } catch (e) {
            console.error('Failed to save dating preference', e);
        }
    };

    const handleContinue = () => {
        if (selectedPreference) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/consent');
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
                <OnboardingProgress currentStep={2} totalSteps={7} width="80%" />
            </View>

            <View style={styles.content}>
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                    <Text style={styles.title}>Dating Scenarios</Text>
                    <Text style={styles.subtitle}>
                        Who would you like to practice dating conversations with?
                    </Text>
                </Animated.View>

                <ScrollView contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                    {preferences.map((pref, index) => {
                        const isSelected = selectedPreference === pref.id;
                        const IconComponent = pref.icon;
                        return (
                            <Animated.View
                                key={pref.id}
                                entering={FadeInDown.delay(300 + (index * 100)).springify()}
                                style={styles.optionWrapper}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        isSelected && styles.optionSelected
                                    ]}
                                    onPress={() => handleSelect(pref.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                                        <IconComponent
                                            size={28}
                                            color={isSelected ? COLORS.primary : COLORS.textDim}
                                        />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {pref.label}
                                        </Text>
                                        <Text style={styles.optionDescription}>
                                            {pref.description}
                                        </Text>
                                    </View>
                                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.footer}>
                    <Text style={styles.footerNote}>
                        You can change this anytime in your profile settings
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, !selectedPreference && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!selectedPreference}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={selectedPreference ? COLORS.primaryGradient : (['#333', '#333'] as const)}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={[styles.buttonText, !selectedPreference && { color: '#666' }]}>Continue</Text>
                            {selectedPreference && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
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
        paddingHorizontal: 0,
    },
    header: {
        paddingTop: 120,
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
        lineHeight: 24,
    },
    optionsContainer: {
        paddingBottom: 160,
        gap: 16,
        paddingHorizontal: SPACING.l,
    },
    optionWrapper: {
        width: '100%',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
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
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainerSelected: {
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
    },
    optionContent: {
        flex: 1,
    },
    optionText: {
        fontSize: 18,
        fontFamily: FONTS.bodyMedium,
        color: COLORS.textDim,
        marginBottom: 4,
    },
    optionTextSelected: {
        color: COLORS.text,
        fontFamily: FONTS.bodyBold,
    },
    optionDescription: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
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
    footerNote: {
        fontSize: 13,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        textAlign: 'center',
        marginBottom: SPACING.m,
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
