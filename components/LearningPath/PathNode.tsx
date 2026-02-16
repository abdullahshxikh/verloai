import React, { useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Lock, Check } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../../constants/theme';

export type NodeState = 'completed' | 'current' | 'unlocked' | 'locked';

interface PathNodeProps {
  title: string;
  order: number;
  state: NodeState;
  x: number;
  y: number;
  onPress: () => void;
  index: number;
}

const NODE_SIZES: Record<NodeState, number> = {
  completed: 64,
  current: 76,
  unlocked: 64,
  locked: 56,
};

const GLOW_SIZE = 92;
const LABEL_WIDTH = 130;

export default function PathNode({ title, order, state, x, y, onPress, index }: PathNodeProps) {
  const size = NODE_SIZES[state];
  const radius = size / 2;

  // Pulse animation for current node
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (state === 'current') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [state]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const renderNodeContent = () => {
    switch (state) {
      case 'completed':
        return (
          <View style={[styles.circle, styles.completedCircle, { width: size, height: size, borderRadius: radius }]}>
            <Check size={24} color="#fff" strokeWidth={3} />
          </View>
        );
      case 'current':
        return (
          <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }}>
            <LinearGradient
              colors={COLORS.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.circle, { width: size, height: size, borderRadius: radius }]}
            >
              <ArrowRight size={28} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </View>
        );
      case 'unlocked':
        return (
          <View style={[styles.circle, styles.unlockedCircle, { width: size, height: size, borderRadius: radius }]}>
            <Text style={styles.orderText}>{order}</Text>
          </View>
        );
      case 'locked':
        return (
          <View style={[styles.circle, styles.lockedCircle, { width: size, height: size, borderRadius: radius }]}>
            <Lock size={18} color={COLORS.textDim} />
          </View>
        );
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(80 + index * 50).duration(400)}
      style={[
        styles.container,
        {
          left: x - radius,
          top: y - radius,
          width: size,
          alignItems: 'center',
        },
      ]}
    >
      {/* Glow ring behind current node */}
      {state === 'current' && (
        <Animated.View
          style={[
            styles.glowRing,
            glowStyle,
            {
              width: GLOW_SIZE,
              height: GLOW_SIZE,
              borderRadius: GLOW_SIZE / 2,
              left: (size - GLOW_SIZE) / 2,
              top: (size - GLOW_SIZE) / 2,
            },
          ]}
        />
      )}

      <TouchableOpacity
        onPress={onPress}
        disabled={state === 'locked'}
        activeOpacity={0.8}
        style={{ alignItems: 'center' }}
      >
        {renderNodeContent()}
      </TouchableOpacity>

      {/* Title label below node */}
      <Text
        style={[
          styles.label,
          state === 'locked' && styles.labelLocked,
          state === 'current' && styles.labelCurrent,
          { width: LABEL_WIDTH, marginTop: state === 'current' ? 10 : 8 },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockedCircle: {
    backgroundColor: COLORS.surface,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
  },
  lockedCircle: {
    backgroundColor: COLORS.surfaceLight,
    opacity: 0.45,
  },
  orderText: {
    fontSize: 20,
    fontFamily: FONTS.display,
    color: COLORS.primary,
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    zIndex: -1,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 15,
  },
  labelLocked: {
    opacity: 0.4,
  },
  labelCurrent: {
    color: COLORS.text,
    fontFamily: FONTS.bodyBold,
  },
});
