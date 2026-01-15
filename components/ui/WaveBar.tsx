import type { ViewStyle } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type Props = {
  bar: SharedValue<number>;
  color: string;
  style: ViewStyle;
};

export function WaveBar({ bar, color, style }: Props) {
  const animatedStyle = useAnimatedStyle(() => ({
    height: bar.value,
    backgroundColor: color,
  }));

  return <Animated.View style={[style, animatedStyle]} />;
}













