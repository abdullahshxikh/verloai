import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../lib/AuthProvider';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function SignInScreen() {
    const router = useRouter();
    const { signIn, signInWithGoogle, signInWithApple } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { error } = await signIn(email, password);

        setLoading(false);

        if (error) {
            Alert.alert('Sign In Failed', error.message);
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
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
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
                                placeholder="Enter your password"
                                placeholderTextColor={COLORS.textDim}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPasswordButton}
                            onPress={() => router.push('/auth/forgot-password')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={handleSignIn}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={COLORS.primaryGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
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
                                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                                    cornerRadius={25}
                                    style={styles.appleButton}
                                    onPress={async () => {
                                        setLoading(true);
                                        const { error } = await signInWithApple();
                                        if (error) {
                                            Alert.alert('Sign In Error', error.message);
                                        }
                                        setLoading(false);
                                    }}
                                />
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => router.replace('/auth/signup')}
                        >
                            <Text style={styles.createAccountText}>Don't have an account? Sign Up</Text>
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
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.s,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontFamily: FONTS.bodyMedium,
        color: COLORS.primary,
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
