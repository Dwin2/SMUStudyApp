import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar as PaperProgressBar } from 'react-native-paper';
import { COLORS } from '../../constants';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
}) => {
  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
          )}
        </View>
      )}
      <PaperProgressBar
        progress={progress}
        color={COLORS.primary}
        style={styles.bar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
});
