import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS } from '../../constants/theme';

interface MilestoneHeaderProps {
  milestoneNumber: number;
  y: number;
  totalWidth: number;
  index: number;
}

export default function MilestoneHeader({ milestoneNumber, y, totalWidth, index }: MilestoneHeaderProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(100 + index * 60).duration(400)}
      style={[
        styles.container,
        {
          top: y,
          width: totalWidth,
          left: 0,
        },
      ]}
    >
      <View style={styles.line} />
      <View style={styles.badge}>
        <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
        <Text style={styles.text}>Milestone {milestoneNumber}</Text>
      </View>
      <View style={styles.line} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  text: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.warning,
    letterSpacing: 0.5,
  },
});
