import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nsydfvhxfptfelfdtmxe.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

/**
 * Extract access_token and refresh_token from an OAuth redirect URL.
 * Supabase appends tokens as URL fragment (#access_token=...&refresh_token=...).
 */
export function extractSessionFromUrl(url: string): { access_token: string; refresh_token: string } | null {
    // Tokens can be in the fragment (#) or as query params (?)
    const hashPart = url.split('#')[1];
    const queryPart = url.split('?')[1];
    const paramString = hashPart || queryPart;
    if (!paramString) return null;

    const params = new URLSearchParams(paramString);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
        return { access_token, refresh_token };
    }
    return null;
}
