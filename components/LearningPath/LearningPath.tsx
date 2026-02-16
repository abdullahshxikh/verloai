import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import PathNode, { NodeState } from './PathNode';
import PathConnector, { ConnectorState } from './PathConnector';
import MilestoneHeader from './MilestoneHeader';
import { LEVELS } from '../../constants/levels';
import type { TrackType } from '../../constants/levels';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PATH_PADDING = 40;
const NODE_MAX_SIZE = 76; // current node size
const VERTICAL_SPACING = 110;
const MILESTONE_HEIGHT = 40;
const MILESTONE_EVERY = 5;
const USABLE_WIDTH = SCREEN_WIDTH - 2 * PATH_PADDING - NODE_MAX_SIZE;

// S-curve positions: center → right → center → left → center (repeat)
const X_PERCENTS = [0.5, 0.85, 0.5, 0.15, 0.5];

interface Level {
  id: string;
  title: string;
  order: number;
  track: TrackType;
  [key: string]: any;
}

interface LearningPathProps {
  levels: Level[];
  completedLevels: string[];
  activeTrack: TrackType;
  onLevelPress: (levelId: string) => void;
}

function getNodeState(
  level: Level,
  index: number,
  filteredList: Level[],
  completedLevels: string[],
  activeTrack: TrackType,
  firstUncompletedUnlocked: number
): NodeState {
  const isCompleted = completedLevels.includes(level.id);
  if (isCompleted) return 'completed';

  let isUnlocked = false;

  if (activeTrack === 'general') {
    // "All" view: sequential based on list position
    if (index === 0) {
      isUnlocked = true;
    } else {
      const prev = filteredList[index - 1];
      isUnlocked = completedLevels.includes(prev.id);
    }
  } else {
    // Track view: order-based
    if (level.order === 1) {
      isUnlocked = true;
    } else {
      const prevInTrack = LEVELS.find(
        (l) => l.track === level.track && l.order === level.order - 1
      );
      if (prevInTrack && completedLevels.includes(prevInTrack.id)) {
        isUnlocked = true;
      }
    }
  }

  if (!isUnlocked) return 'locked';

  // First unlocked-but-not-completed = current
  if (index === firstUncompletedUnlocked) return 'current';
  return 'unlocked';
}

export default function LearningPath({
  levels,
  completedLevels,
  activeTrack,
  onLevelPress,
}: LearningPathProps) {
  // Pre-compute the index of the first unlocked-but-not-completed level
  const firstUncompletedUnlocked = useMemo(() => {
    for (let i = 0; i < levels.length; i++) {
      const isCompleted = completedLevels.includes(levels[i].id);
      if (isCompleted) continue;

      let isUnlocked = false;
      if (activeTrack === 'general') {
        isUnlocked = i === 0 || completedLevels.includes(levels[i - 1].id);
      } else {
        if (levels[i].order === 1) {
          isUnlocked = true;
        } else {
          const prev = LEVELS.find(
            (l) => l.track === levels[i].track && l.order === levels[i].order - 1
          );
          isUnlocked = !!prev && completedLevels.includes(prev.id);
        }
      }

      if (isUnlocked) return i;
    }
    return -1; // All completed
  }, [levels, completedLevels, activeTrack]);

  // Compute node positions accounting for milestones
  const { nodePositions, milestones, totalHeight, currentNodeY } = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const mils: { milestoneNumber: number; y: number; nodeIndex: number }[] = [];
    let yOffset = NODE_MAX_SIZE / 2 + 20; // initial top padding
    let milestoneCount = 0;

    for (let i = 0; i < levels.length; i++) {
      // Insert milestone before every MILESTONE_EVERY-th node (except 0)
      if (i > 0 && i % MILESTONE_EVERY === 0) {
        milestoneCount++;
        mils.push({ milestoneNumber: milestoneCount, y: yOffset - 8, nodeIndex: i });
        yOffset += MILESTONE_HEIGHT + 16;
      }

      const cycleIdx = i % X_PERCENTS.length;
      const xCenter = PATH_PADDING + NODE_MAX_SIZE / 2 + USABLE_WIDTH * X_PERCENTS[cycleIdx];

      positions.push({ x: xCenter, y: yOffset });
      yOffset += VERTICAL_SPACING;
    }

    const height = yOffset + 60; // bottom padding
    const curY = firstUncompletedUnlocked >= 0 ? positions[firstUncompletedUnlocked]?.y ?? 0 : 0;

    return { nodePositions: positions, milestones: mils, totalHeight: height, currentNodeY: curY };
  }, [levels, firstUncompletedUnlocked]);

  // Compute node states
  const nodeStates = useMemo(() => {
    return levels.map((level, i) =>
      getNodeState(level, i, levels, completedLevels, activeTrack, firstUncompletedUnlocked)
    );
  }, [levels, completedLevels, activeTrack, firstUncompletedUnlocked]);

  // Compute connector states
  const connectorStates: ConnectorState[] = useMemo(() => {
    const states: ConnectorState[] = [];
    for (let i = 0; i < levels.length - 1; i++) {
      const fromState = nodeStates[i];
      const toState = nodeStates[i + 1];

      if (fromState === 'completed' && toState === 'completed') {
        states.push('completed');
      } else if (fromState === 'completed' && (toState === 'current' || toState === 'unlocked')) {
        states.push('active');
      } else {
        states.push('locked');
      }
    }
    return states;
  }, [nodeStates, levels]);

  if (levels.length === 0) return null;

  return (
    <View style={{ height: totalHeight, width: SCREEN_WIDTH - 48 }}>
      {/* SVG connectors behind everything */}
      <PathConnector
        positions={nodePositions}
        states={connectorStates}
        totalHeight={totalHeight}
        totalWidth={SCREEN_WIDTH - 48}
      />

      {/* Milestones */}
      {milestones.map((m, i) => (
        <MilestoneHeader
          key={`milestone-${m.milestoneNumber}`}
          milestoneNumber={m.milestoneNumber}
          y={m.y}
          totalWidth={SCREEN_WIDTH - 48}
          index={m.nodeIndex}
        />
      ))}

      {/* Nodes */}
      {levels.map((level, i) => (
        <PathNode
          key={level.id}
          title={level.title}
          order={level.order}
          state={nodeStates[i]}
          x={nodePositions[i].x}
          y={nodePositions[i].y}
          onPress={() => onLevelPress(level.id)}
          index={i}
        />
      ))}
    </View>
  );
}

export { LearningPath };
export type { LearningPathProps };
