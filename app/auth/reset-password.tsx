import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';
import { Lock, CheckCircle } from 'lucide-react-native';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { error } = await supabase.auth.updateUser({ password });

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setDone(true);
        }
    };

    if (done) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={[COLORS.background, '#1a1a2e']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.successContent}>
                    <Animated.View entering={FadeInUp.delay(200).springify()}>
                        <CheckCircle size={64} color={COLORS.success} />
                    </Animated.View>
                    <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.successTextContainer}>
                        <Text style={styles.successTitle}>Password Updated</Text>
                        <Text style={styles.successSubtitle}>
                            Your password has been successfully changed. You can now sign in with your new password.
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(600).springify()} style={{ width: '100%' }}>
                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={() => router.replace('/(tabs)')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={COLORS.primaryGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>Continue</Text>
                            </LinearGradient>
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
                    <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Lock size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>New Password</Text>
                        <Text style={styles.subtitle}>
                            Choose a strong password for your account.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>New Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="At least 6 characters"
                                placeholderTextColor={COLORS.textDim}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password-new"
                                autoFocus
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter your password"
                                placeholderTextColor={COLORS.textDim}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password-new"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={handleUpdatePassword}
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
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Text>
                            </LinearGradient>
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
    successContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    successTextContainer: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
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
    },
});
