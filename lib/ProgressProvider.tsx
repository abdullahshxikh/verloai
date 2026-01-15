import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, isSameDay } from 'date-fns';
import { useAuth } from './AuthProvider';
import { supabase } from './supabase';

interface ProgressContextType {
    streak: number;
    xp: number;
    charismaScore: number;
    lastPracticeDate: string | null; // ISO string
    completedLevels: string[];
    completeLevel: (levelId: string, xpEarned: number) => Promise<void>;
    updateCharismaScore: (score: number) => Promise<void>;
    checkStreak: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [xp, setXp] = useState(0);
    const [charismaScore, setCharismaScore] = useState(0);
    const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);
    const [completedLevels, setCompletedLevels] = useState<string[]>([]);

    useEffect(() => {
        loadProgress();
    }, []);

    // Sync to Supabase when state changes and user is logged in
    useEffect(() => {
        if (user) {
            syncProgress();
        }
    }, [streak, xp, charismaScore, completedLevels, user]);

    const syncProgress = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    streak,
                    xp,
                    charisma_score: charismaScore,
                    completed_levels: completedLevels,
                    last_practice_date: lastPracticeDate,
                    updated_at: new Date().toISOString()
                });
            if (error) {
                if (error.code === 'PGRST205') {
                    console.warn('⚠️ Supabase sync failed: "profiles" table not found. Please run the SQL in SUPABASE_SETUP.sql in your Supabase Dashboard.');
                    return;
                }
                console.error('Sync error:', error);
            }
        } catch (e) {
            console.error('Failed to sync to Supabase', e);
        }
    };

    const loadProgress = async () => {
        try {
            const storedStreak = await AsyncStorage.getItem('user_streak');
            const storedXp = await AsyncStorage.getItem('user_xp');
            const storedScore = await AsyncStorage.getItem('user_charisma_score');
            const storedDate = await AsyncStorage.getItem('last_practice_date');
            const storedLevels = await AsyncStorage.getItem('completed_levels');

            if (storedStreak) setStreak(parseInt(storedStreak, 10));
            if (storedXp) setXp(parseInt(storedXp, 10));
            if (storedScore) setCharismaScore(parseInt(storedScore, 10));
            if (storedDate) setLastPracticeDate(storedDate);
            if (storedLevels) setCompletedLevels(JSON.parse(storedLevels));

            // Check streak initially
            if (storedDate) {
                validateStreak(parseInt(storedStreak || '0', 10), storedDate);
            }
        } catch (e) {
            console.error('Failed to load progress', e);
        }
    };

    const validateStreak = async (currentStreak: number, lastDateStr: string) => {
        const lastDate = new Date(lastDateStr);
        const today = new Date();

        // Diff in days
        const diff = differenceInDays(today, lastDate);

        // If practiced today, all good
        if (isSameDay(today, lastDate)) return;

        // If practiced yesterday, streak is safe but not incremented yet (wait for practice)
        if (diff === 1) return;

        // If > 1 day gap, reset streak
        if (diff > 1 && currentStreak > 0) {
            setStreak(0);
            await AsyncStorage.setItem('user_streak', '0');
        }
    };

    const completeLevel = async (levelId: string, xpEarned: number) => {
        try {
            const today = new Date();
            let newStreak = streak;
            const newXp = xp + xpEarned;

            // Handle Streak
            if (!lastPracticeDate) {
                // First ever practice
                newStreak = 1;
            } else {
                const lastDate = new Date(lastPracticeDate);
                if (!isSameDay(today, lastDate)) {
                    const diff = differenceInDays(today, lastDate);
                    if (diff === 1) {
                        // Consecutive day
                        newStreak += 1;
                    } else {
                        // Gap (should have been reset by load check, but just in case)
                        newStreak = 1;
                    }
                }
                // If same day, don't increment streak
            }

            // Update Levels
            const newCompletedLevels = [...completedLevels];
            if (!newCompletedLevels.includes(levelId)) {
                newCompletedLevels.push(levelId);
            }

            // State Updates
            setStreak(newStreak);
            setXp(newXp);
            setLastPracticeDate(today.toISOString());
            setCompletedLevels(newCompletedLevels);

            // Persist locally
            await AsyncStorage.setItem('user_streak', newStreak.toString());
            await AsyncStorage.setItem('user_xp', newXp.toString());
            await AsyncStorage.setItem('last_practice_date', today.toISOString());
            await AsyncStorage.setItem('completed_levels', JSON.stringify(newCompletedLevels));

        } catch (e) {
            console.error('Failed to save completion', e);
        }
    };

    const updateCharismaScore = async (score: number) => {
        try {
            setCharismaScore(score);
            await AsyncStorage.setItem('user_charisma_score', score.toString());
        } catch (e) {
            console.error('Failed to update charisma score', e);
        }
    };

    const checkStreak = async () => {
        if (lastPracticeDate) {
            await validateStreak(streak, lastPracticeDate);
        }
    };

    return (
        <ProgressContext.Provider value={{ streak, xp, charismaScore, lastPracticeDate, completedLevels, completeLevel, updateCharismaScore, checkStreak }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
}
