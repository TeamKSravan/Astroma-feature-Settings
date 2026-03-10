import { StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '../constants/colors';
import { scale, verticalScale } from '../utils/scale';

interface ProgressBarProps {
  completedSegments: number;
  totalSegments?: number;
}

export default function ProgressBar({
  completedSegments,
  totalSegments = 6,
}: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSegments }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            index < completedSegments && styles.completedSegment,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: verticalScale(8),
  },
  segment: {
    flex: 1,
    height: verticalScale(4),
    backgroundColor: colors.white + '20',
    borderRadius: scale(2),
  },
  completedSegment: {
    backgroundColor: colors.primary,
  },
});
