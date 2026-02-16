import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, extractSessionFromUrl } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { AppState, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

// Handle deep links for OAuth
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signInWithGoogle: () => Promise<{ error: any }>;
    signInWithApple: () => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session with error handling
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            })
            .catch((error) => {
                console.warn('Supabase session fetch failed (network issue):', error);
                setSession(null);
                setUser(null);
                setLoading(false);
            });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Handle password recovery event - user clicked reset link
            if (event === 'PASSWORD_RECOVERY') {
                // Small delay to ensure navigation is ready
                setTimeout(() => {
                    import('expo-router').then(({ router }) => {
                        router.push('/auth/reset-password');
                    });
                }, 100);
            }
        });

        // Listen for incoming links (Deep Linking for OAuth)
        const handleDeepLink = async (event: { url: string }) => {
            if (event.url) {
                const tokens = extractSessionFromUrl(event.url);
                if (tokens) {
                    const { error } = await supabase.auth.setSession({
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                    });
                    if (error) console.error('Failed to set session from deep link:', error);
                }
            }
        };
        const sub = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.unsubscribe();
            sub.remove();
        };

    }, []);

    // Also tell Supabase to stop/start auto refresh on app state change (optimization)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                supabase.auth.startAutoRefresh();
            } else {
                supabase.auth.stopAutoRefresh();
            }
        });
        return () => subscription.remove();
    }, []);

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { error };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signInWithGoogle = async () => {
        try {
            // makeRedirectUri handles Expo Go (exp://), dev builds, and standalone correctly
            const redirectUrl = makeRedirectUri({
                path: 'auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });
            if (error) throw error;

            if (data?.url) {
                // Open the OAuth flow in an in-app browser
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

                if (result.type === 'cancel' || result.type === 'dismiss') {
                    // User cancelled — not an error
                    return { error: null };
                }

                if (result.type === 'success' && result.url) {
                    // Extract tokens from the redirect URL and set the session
                    const tokens = extractSessionFromUrl(result.url);
                    if (tokens) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token,
                        });
                        if (sessionError) throw sessionError;
                    } else {
                        // Fallback: try refreshing session — tokens may have been set via deep link listener
                        await supabase.auth.getSession();
                    }
                }
            }

            return { error: null };
        } catch (error: any) {
            // Ignore user cancellation errors
            if (error?.message?.includes('cancel') || error?.message?.includes('dismiss') || error?.code === 'ERR_REQUEST_CANCELED') {
                return { error: null };
            }
            console.error("Google Sign-In Error:", error);
            return { error };
        }
    };

    const signInWithApple = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential.identityToken) {
                throw new Error('No identity token received from Apple');
            }

            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
            });

            if (error) throw error;

            return { error: null };
        } catch (error: any) {
            // User cancelled the sign-in flow
            if (error.code === 'ERR_REQUEST_CANCELED') {
                return { error: null };
            }
            console.error('Apple Sign-In Error:', error);
            return { error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signInWithGoogle, signInWithApple, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
