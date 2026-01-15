import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackType } from '../constants/levels';

const TRACK_KEY = '@charisma_active_track';

interface TracksContextType {
    activeTrack: TrackType;
    setActiveTrack: (track: TrackType) => Promise<void>;
    loading: boolean;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

export function TracksProvider({ children }: { children: React.ReactNode }) {
    const [activeTrack, setActiveTrackState] = useState<TrackType>('general');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrack();
    }, []);

    const loadTrack = async () => {
        try {
            const savedTrack = await AsyncStorage.getItem(TRACK_KEY);
            if (savedTrack && isValidTrack(savedTrack)) {
                setActiveTrackState(savedTrack as TrackType);
            }
        } catch (error) {
            console.error('Error loading active track:', error);
        } finally {
            setLoading(false);
        }
    };

    const setActiveTrack = async (track: TrackType) => {
        try {
            await AsyncStorage.setItem(TRACK_KEY, track);
            setActiveTrackState(track);
        } catch (error) {
            console.error('Error setting active track:', error);
        }
    };

    const isValidTrack = (track: string): boolean => {
        return ['general', 'social', 'professional', 'dating'].includes(track);
    };

    return (
        <TracksContext.Provider value={{ activeTrack, setActiveTrack, loading }}>
            {children}
        </TracksContext.Provider>
    );
}

export function useTracks() {
    const context = useContext(TracksContext);
    if (context === undefined) {
        throw new Error('useTracks must be used within a TracksProvider');
    }
    return context;
}
