import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Card } from '../common';
import { COLORS, NEUTRAL_PROMPT_QUESTIONS, SOCIAL_MEDIA_APPS } from '../../constants';

interface NeutralPromptProps {
  platform: string;
  onSubmit: (question: string, response: string) => void;
  onSkip?: () => void;
}

export const NeutralPrompt: React.FC<NeutralPromptProps> = ({
  platform,
  onSubmit,
  onSkip,
}) => {
  const [response, setResponse] = useState('');

  // Select a random question
  const question = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * NEUTRAL_PROMPT_QUESTIONS.length);
    return NEUTRAL_PROMPT_QUESTIONS[randomIndex];
  }, []);

  const platformName =
    SOCIAL_MEDIA_APPS.find((app) => app.id === platform)?.name || platform;

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(question, response.trim());
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

          <Text style={styles.intro}>Take a moment to notice your surroundings.</Text>

          <Text style={styles.question}>{question}</Text>

          <TextInput
            value={response}
            onChangeText={setResponse}
            placeholder="Your observation..."
            multiline
            numberOfLines={3}
            autoFocus
          />

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
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  platformIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  intro: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
