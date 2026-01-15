import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@charisma_onboarding_completed';

interface OnboardingContextType {
    hasCompletedOnboarding: boolean;
    completeOnboarding: () => Promise<void>;
    resetOnboarding: () => Promise<void>;
    loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_KEY);
            setHasCompletedOnboarding(value === 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
        } finally {
            setLoading(false);
        }
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            setHasCompletedOnboarding(true);
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            setHasCompletedOnboarding(false);
        } catch (error) {
            console.error('Error resetting onboarding:', error);
            throw error;
        }
    };

    return (
        <OnboardingContext.Provider value={{ hasCompletedOnboarding, completeOnboarding, resetOnboarding, loading }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
