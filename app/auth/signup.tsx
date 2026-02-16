import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../lib/AuthProvider';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function SignUpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { signUp, signInWithGoogle, signInWithApple } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { error } = await signUp(email, password);

        setLoading(false);

        if (error) {
            Alert.alert('Sign Up Failed', error.message);
        } else {
            // Auto login logic usually happens inside useAuth or Supabase automatically for email/pass if we turned off email confirmation.
            // But if confirmation is ON, we need to tell them.
            // Assuming for now confirmation is OFF or handled.

            // Actually, if confirmation is OFF (typical for dev), session is set.
            // If session is set, _layout will redirect to Paywall because onboarding is incomplete.

            // So we can just wait or manually replace.
            // Let's manually replace to be safe.
            router.replace({
                pathname: '/paywall',
                params: params as any // Types might be tricky with useLocalSearchParams, so casting to any or Record<string, string> is safer generally
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, '#1a1a2e']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                        <Text style={styles.appName}>Verlo AI</Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to save your progress</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={COLORS.textDim}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="At least 6 characters"
                                placeholderTextColor={COLORS.textDim}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password-new"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={handleSignUp}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={COLORS.primaryGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.separatorContainer}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>or continue with</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                onPress={async () => {
                                    setLoading(true);
                                    const { error } = await signInWithGoogle();
                                    if (error) {
                                        Alert.alert('Sign In Error', error.message);
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                style={styles.googleButtonWrapper}
                            >
                                <Image
                                    source={require('../../assets/images/google_dark.png')}
                                    style={styles.googleImageButton}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>

                            {Platform.OS === 'ios' && (
                                <AppleAuthentication.AppleAuthenticationButton
                                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                                    cornerRadius={25}
                                    style={styles.appleButton}
                                    onPress={async () => {
                                        setLoading(true);
                                        const { error } = await signInWithApple();
                                        if (error) {
                                            Alert.alert('Sign Up Error', error.message);
                                        }
                                        setLoading(false);
                                    }}
                                />
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => router.replace('/auth/signin')}
                        >
                            <Text style={styles.createAccountText}>Already have an account? Sign In</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    appName: {
        fontSize: 28,
        fontFamily: FONTS.display,
        color: COLORS.primary,
        marginBottom: SPACING.m,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bodyBold,
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: SPACING.l,
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: FONTS.body,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    buttonWrapper: {
        marginTop: SPACING.m,
        borderRadius: 12,
        overflow: 'hidden',
    },
    button: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: FONTS.bodyBold,
    },
    linkButton: {
        marginTop: SPACING.xxl,
        alignItems: 'center',
    },
    createAccountText: {
        fontSize: 16,
        color: COLORS.textDim,
        fontFamily: FONTS.bodyBold,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.l,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.surfaceLight,
    },
    separatorText: {
        marginHorizontal: 12,
        color: COLORS.textDim,
        fontSize: 12,
        fontFamily: FONTS.body,
    },
    socialButtons: {
        gap: 12,
        marginBottom: SPACING.m,
    },
    googleButtonWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleImageButton: {
        width: '100%',
        height: 50,
    },
    appleButton: {
        width: '70%',
        height: 50,
        alignSelf: 'center',
    },
});
