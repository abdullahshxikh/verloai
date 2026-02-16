import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, isSameDay } from 'date-fns';
import { useAuth } from './AuthProvider';
import { supabase } from './supabase';

interface CharismaHistoryPoint {
    score: number;
    recorded_at: string;
}

interface ProgressContextType {
    streak: number;
    xp: number;
    charismaScore: number;
    lastPracticeDate: string | null; // ISO string
    completedLevels: string[];
    charismaHistory: CharismaHistoryPoint[];
    // Personalization
    avatarUrl: string | null;
    fullName: string | null;
    datingAvatarPreference: 'men' | 'women' | 'auto' | null;

    // Actions
    completeLevel: (levelId: string, xpEarned: number) => Promise<void>;
    updateCharismaScore: (score: number) => Promise<void>;
    checkStreak: () => Promise<void>;
    updateProfile: (updates: Partial<{ avatarUrl: string; fullName: string }>) => Promise<void>;
    updateDatingPreference: (pref: 'men' | 'women' | 'auto') => Promise<void>;
    loadCharismaHistory: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Stats
    const [streak, setStreak] = useState(0);
    const [xp, setXp] = useState(0);
    const [charismaScore, setCharismaScore] = useState(0);
    const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);
    const [completedLevels, setCompletedLevels] = useState<string[]>([]);

    // Personalization
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [datingAvatarPreference, setDatingAvatarPreference] = useState<'men' | 'women' | 'auto' | null>(null);
    const [charismaHistory, setCharismaHistory] = useState<CharismaHistoryPoint[]>([]);

    const [initialLoadDone, setInitialLoadDone] = useState(false);

    useEffect(() => {
        loadProgress();
    }, [user]);

    // Sync to Supabase when state changes and user is logged in
    // Only after initial load completes to avoid overwriting remote data with defaults
    useEffect(() => {
        if (user && initialLoadDone) {
            syncProgress();
        }
    }, [streak, xp, charismaScore, completedLevels, avatarUrl, fullName, datingAvatarPreference, user, initialLoadDone]);

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
                    avatar_url: avatarUrl,
                    full_name: fullName,
                    dating_avatar_preference: datingAvatarPreference,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
            if (error) {
                console.error('Sync error:', error.message);
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
            const storedAvatar = await AsyncStorage.getItem('user_avatar_url');
            const storedName = await AsyncStorage.getItem('user_full_name');
            const storedDatingPref = await AsyncStorage.getItem('dating_avatar_preference');

            if (storedStreak) setStreak(parseInt(storedStreak, 10));
            if (storedXp) setXp(parseInt(storedXp, 10));
            if (storedScore) setCharismaScore(parseInt(storedScore, 10));
            if (storedDate) setLastPracticeDate(storedDate);
            if (storedLevels) setCompletedLevels(JSON.parse(storedLevels));
            if (storedAvatar) setAvatarUrl(storedAvatar);
            if (storedName) setFullName(storedName);
            if (storedDatingPref) setDatingAvatarPreference(storedDatingPref as 'men' | 'women' | 'auto');

            // Check streak initially
            if (storedDate) {
                validateStreak(parseInt(storedStreak || '0', 10), storedDate);
            }

            // Also fetch fresh from Supabase if logged in — Supabase is source of truth
            if (user) {
                const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data && !error) {
                    // Sync ALL progress fields from Supabase (not just avatar/name)
                    if (data.avatar_url) setAvatarUrl(data.avatar_url);
                    if (data.full_name) setFullName(data.full_name);
                    if (data.charisma_score != null) {
                        setCharismaScore(data.charisma_score);
                        await AsyncStorage.setItem('user_charisma_score', data.charisma_score.toString());
                    }
                    if (data.streak != null) {
                        setStreak(data.streak);
                        await AsyncStorage.setItem('user_streak', data.streak.toString());
                    }
                    if (data.xp != null) {
                        setXp(data.xp);
                        await AsyncStorage.setItem('user_xp', data.xp.toString());
                    }
                    if (data.completed_levels && Array.isArray(data.completed_levels)) {
                        setCompletedLevels(data.completed_levels);
                        await AsyncStorage.setItem('completed_levels', JSON.stringify(data.completed_levels));
                    }
                }

                // Load charisma score history
                const { data: historyData, error: historyError } = await supabase.rpc('get_charisma_history');
                if (!historyError && historyData !== null && historyData !== undefined) {
                    const parsed = typeof historyData === 'string' ? JSON.parse(historyData) : historyData;
                    if (Array.isArray(parsed)) {
                        setCharismaHistory(parsed as CharismaHistoryPoint[]);
                    }
                }
            }

            setInitialLoadDone(true);
        } catch (e) {
            console.error('Failed to load progress', e);
            setInitialLoadDone(true);
        }
    };

    const validateStreak = async (currentStreak: number, lastDateStr: string) => {
        const lastDate = new Date(lastDateStr);
        const today = new Date();
        const diff = differenceInDays(today, lastDate);

        if (isSameDay(today, lastDate)) return;
        if (diff === 1) return;

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

            if (!lastPracticeDate) {
                newStreak = 1;
            } else {
                const lastDate = new Date(lastPracticeDate);
                if (!isSameDay(today, lastDate)) {
                    const diff = differenceInDays(today, lastDate);
                    if (diff === 1) {
                        newStreak += 1;
                    } else {
                        newStreak = 1;
                    }
                }
            }

            const newCompletedLevels = [...completedLevels];
            if (!newCompletedLevels.includes(levelId)) {
                newCompletedLevels.push(levelId);
            }

            setStreak(newStreak);
            setXp(newXp);
            setLastPracticeDate(today.toISOString());
            setCompletedLevels(newCompletedLevels);

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

            // Record to Supabase history if logged in
            if (user) {
                const { data, error } = await supabase.rpc('record_charisma_score', { p_score: score });
                if (!error && data) {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (Array.isArray(parsed)) {
                        setCharismaHistory(
                            (parsed as CharismaHistoryPoint[]).sort(
                                (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
                            )
                        );
                    }
                }
            }
        } catch (e) {
            console.error('Failed to update charisma score', e);
        }
    };

    const loadCharismaHistory = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.rpc('get_charisma_history');
            console.log('Charisma history RPC response:', { data, error, type: typeof data });
            if (error) {
                console.error('Charisma history RPC error:', error);
                return;
            }
            if (data !== null && data !== undefined) {
                // RPC returns json scalar — handle both parsed array and string cases
                const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                if (Array.isArray(parsed)) {
                    setCharismaHistory(parsed as CharismaHistoryPoint[]);
                    console.log('Charisma history loaded:', parsed.length, 'points');
                } else {
                    console.warn('Charisma history parsed but not an array:', parsed);
                }
            }
        } catch (e) {
            console.error('Failed to load charisma history', e);
        }
    };

    const updateProfile = async (updates: Partial<{ avatarUrl: string; fullName: string }>) => {
        if (updates.avatarUrl !== undefined) {
            setAvatarUrl(updates.avatarUrl);
            await AsyncStorage.setItem('user_avatar_url', updates.avatarUrl || '');
        }
        if (updates.fullName !== undefined) {
            setFullName(updates.fullName);
            await AsyncStorage.setItem('user_full_name', updates.fullName || '');
        }
    };

    const updateDatingPreference = async (pref: 'men' | 'women' | 'auto') => {
        setDatingAvatarPreference(pref);
        await AsyncStorage.setItem('dating_avatar_preference', pref);
    };

    const checkStreak = async () => {
        if (lastPracticeDate) {
            await validateStreak(streak, lastPracticeDate);
        }
    };

    return (
        <ProgressContext.Provider value={{
            streak, xp, charismaScore, lastPracticeDate, completedLevels, charismaHistory,
            avatarUrl, fullName, datingAvatarPreference,
            completeLevel, updateCharismaScore, checkStreak, updateProfile, updateDatingPreference, loadCharismaHistory
        }}>
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
