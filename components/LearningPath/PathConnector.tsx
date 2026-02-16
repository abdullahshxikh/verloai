import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

export type ConnectorState = 'completed' | 'active' | 'locked';

interface PathConnectorProps {
  positions: { x: number; y: number }[];
  states: ConnectorState[];
  totalHeight: number;
  totalWidth: number;
}

const CONNECTOR_STYLES: Record<ConnectorState, { color: string; width: number; dash: string; opacity: number }> = {
  completed: { color: COLORS.success, width: 3, dash: '', opacity: 1 },
  active: { color: COLORS.primary, width: 3, dash: '8 6', opacity: 1 },
  locked: { color: COLORS.surfaceLight, width: 2, dash: '4 8', opacity: 0.4 },
};

export default function PathConnector({ positions, states, totalHeight, totalWidth }: PathConnectorProps) {
  if (positions.length < 2) return null;

  const segments: React.ReactNode[] = [];

  for (let i = 0; i < positions.length - 1; i++) {
    const from = positions[i];
    const to = positions[i + 1];
    const style = CONNECTOR_STYLES[states[i] || 'locked'];

    // Cubic bezier for smooth S-curve
    const cp1x = from.x;
    const cp1y = from.y + (to.y - from.y) * 0.4;
    const cp2x = to.x;
    const cp2y = from.y + (to.y - from.y) * 0.6;

    const d = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;

    segments.push(
      <Path
        key={`seg-${i}`}
        d={d}
        stroke={style.color}
        strokeWidth={style.width}
        strokeDasharray={style.dash || undefined}
        strokeLinecap="round"
        fill="none"
        opacity={style.opacity}
      />
    );
  }

  return (
    <Svg
      width={totalWidth}
      height={totalHeight}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
    >
      {segments}
    </Svg>
  );
}
