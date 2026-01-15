import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface OnboardingProgressProps {
    currentStep: number;
    totalSteps: number;
    width?: number | string;
    style?: ViewStyle;
}

export default function OnboardingProgress({ currentStep, totalSteps, width = 120, style }: OnboardingProgressProps) {
    // Calculate percentage, clamped between 0 and 100
    const progress = Math.min(Math.max((currentStep / totalSteps) * 100, 5), 100);

    return (
        <View style={[styles.track, { width: width as any }, style]}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        height: 6,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
});
