import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Card } from '../common';
import { COLORS, MOTIVATION_PROMPT, SOCIAL_MEDIA_APPS } from '../../constants';

interface MotivationPromptProps {
  platform: string;
  onSubmit: (response: string) => void;
  onSkip?: () => void;
}

export const MotivationPrompt: React.FC<MotivationPromptProps> = ({
  platform,
  onSubmit,
  onSkip,
}) => {
  const [response, setResponse] = useState('');

  const platformName =
    SOCIAL_MEDIA_APPS.find((app) => app.id === platform)?.name || platform;

  const questionText = MOTIVATION_PROMPT.question.replace('[platform]', platformName);

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.platformIcon}>{platformName[0]}</Text>
          </View>

          <Text style={styles.intro}>{MOTIVATION_PROMPT.intro}</Text>

          <Text style={styles.question}>{questionText}</Text>

          <TextInput
            value={response}
            onChangeText={setResponse}
            placeholder="Share your thoughts..."
            multiline
            numberOfLines={4}
            autoFocus
          />

          <Text style={styles.note}>{MOTIVATION_PROMPT.note}</Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Continue"
              onPress={handleSubmit}
              disabled={!response.trim()}
            />
            {onSkip && (
              <Button
                title="Skip"
                onPress={onSkip}
                mode="text"
              />
            )}
          </View>
        </Card>
      </View>
    </KeyboardAvoidingView>
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  platformIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  intro: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  note: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
