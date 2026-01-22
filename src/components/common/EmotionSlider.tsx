import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS } from '../../constants';

interface EmotionSliderProps {
  emotion: string;
  value: number;
  onChange: (value: number) => void;
  positive?: boolean;
}

export const EmotionSlider: React.FC<EmotionSliderProps> = ({
  emotion,
  value,
  onChange,
  positive = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emotion}>{emotion}</Text>
        <Text style={styles.value}>{Math.round(value)}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={positive ? COLORS.primary : COLORS.error}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={positive ? COLORS.primary : COLORS.error}
      />
      <View style={styles.labels}>
        <Text style={styles.labelText}>Not at all</Text>
        <Text style={styles.labelText}>Extremely</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotion: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  labelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
