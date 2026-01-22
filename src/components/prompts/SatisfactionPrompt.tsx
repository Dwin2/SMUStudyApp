import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common';
import { COLORS, SATISFACTION_OPTIONS, SOCIAL_MEDIA_APPS } from '../../constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SatisfactionPromptProps {
  platform: string;
  onSubmit: (satisfaction: string) => void;
}

export const SatisfactionPrompt: React.FC<SatisfactionPromptProps> = ({
  platform,
  onSubmit,
}) => {
  const platformName =
    SOCIAL_MEDIA_APPS.find((app) => app.id === platform)?.name || platform;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.question}>
            How satisfied are you with your experience on {platformName} just now?
          </Text>

          <View style={styles.optionsContainer}>
            {SATISFACTION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                onPress={() => onSubmit(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={48}
                    color={
                      option.value === 'satisfied'
                        ? COLORS.success
                        : option.value === 'not_satisfied'
                        ? COLORS.error
                        : COLORS.textSecondary
                    }
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  option: {
    alignItems: 'center',
    padding: 12,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
});
