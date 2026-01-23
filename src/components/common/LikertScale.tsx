import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants';

interface LikertScaleProps {
  question: string;
  value: number | null;
  onChange: (value: number) => void;
  labels?: string[];
  min?: number;
  max?: number;
}

export const LikertScale: React.FC<LikertScaleProps> = ({
  question,
  value,
  onChange,
  labels = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  min = 1,
  max = 5,
}) => {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.scaleContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              value === option && styles.optionSelected,
            ]}
            onPress={() => onChange(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                value === option && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.labelsContainer}>
        <Text style={styles.labelText}>{labels[0]}</Text>
        <Text style={styles.labelText}>{labels[labels.length - 1]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  question: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 20,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  option: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    maxWidth: '40%',
  },
});
