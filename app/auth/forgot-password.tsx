import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'verloai://auth/reset-password',
        });

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSent(true);
        }
    };

    if (sent) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={[COLORS.background, '#1a1a2e']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.successContent}>
                    <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.successIcon}>
                        <CheckCircle size={64} color={COLORS.success} />
                    </Animated.View>
                    <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.successTextContainer}>
                        <Text style={styles.successTitle}>Check Your Email</Text>
                        <Text style={styles.successSubtitle}>
                            We sent a password reset link to{'\n'}
                            <Text style={styles.emailHighlight}>{email}</Text>
                        </Text>
                        <Text style={styles.successHint}>
                            Didn't receive it? Check your spam folder or try again.
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.successActions}>
                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={() => setSent(false)}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={COLORS.primaryGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>Try Again</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => router.replace('/auth/signin')}
                        >
                            <Text style={styles.linkText}>Back to Sign In</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

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
                    {/* Back Button */}
                    <Animated.View entering={FadeInUp.delay(100).springify()}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <ArrowLeft size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Mail size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            No worries. Enter the email associated with your account and we'll send you a link to reset your password.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={COLORS.textDim}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                                autoFocus
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={handleResetPassword}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={COLORS.primaryGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => router.replace('/auth/signin')}
                        >
                            <Text style={styles.linkText}>Back to Sign In</Text>
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
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        marginBottom: SPACING.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: 'rgba(108, 92, 231, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.display,
        color: COLORS.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: SPACING.m,
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
    linkText: {
        fontSize: 16,
        color: COLORS.textDim,
        fontFamily: FONTS.bodyBold,
    },
    // Success state styles
    successContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    successIcon: {
        marginBottom: SPACING.xl,
    },
    successTextContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    successTitle: {
        fontSize: 24,
        fontFamily: FONTS.display,
        color: COLORS.text,
        marginBottom: 12,
    },
    successSubtitle: {
        fontSize: 16,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 12,
    },
    emailHighlight: {
        color: COLORS.primary,
        fontFamily: FONTS.bodyBold,
    },
    successHint: {
        fontSize: 13,
        fontFamily: FONTS.body,
        color: COLORS.textDim,
        textAlign: 'center',
        opacity: 0.7,
    },
    successActions: {
        width: '100%',
    },
});
