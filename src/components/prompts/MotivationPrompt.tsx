import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { Button, TextInput } from '../common';
import { COLORS, MOTIVATION_PROMPT, SOCIAL_MEDIA_APPS } from '../../constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_MAP: Record<string, string> = {
  facebook: 'facebook',
  instagram: 'instagram',
  youtube: 'youtube',
  tiktok: 'music-note',
  snapchat: 'snapchat',
  twitter: 'twitter',
  whatsapp: 'whatsapp',
  discord: 'discord',
};

const APP_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  youtube: '#FF0000',
  tiktok: '#010101',
  snapchat: '#FFFC00',
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  discord: '#5865F2',
};

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const platformName =
    SOCIAL_MEDIA_APPS.find((app) => app.id === platform)?.name || platform;
  const appColor = APP_COLORS[platform] || COLORS.primary;
  const iconName = ICON_MAP[platform] || 'application';
  const questionText = MOTIVATION_PROMPT.question.replace('[platform]', platformName);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim());
    }
  };

  return (
    <SafeAreaView style={styles.lockScreen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <View style={[styles.appBadge, { backgroundColor: appColor }]}>
            <MaterialCommunityIcons name={iconName as any} size={18} color="#fff" />
            <Text style={styles.appBadgeText}>{platformName}</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.centerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Big icon */}
          <View style={[styles.bigIcon, { backgroundColor: appColor + '18' }]}>
            <MaterialCommunityIcons name={iconName as any} size={48} color={appColor} />
          </View>

          {/* Title */}
          <Text style={styles.lockTitle}>Before you open {platformName}...</Text>

          {/* Intro text */}
          <Text style={styles.lockSubtitle}>{MOTIVATION_PROMPT.intro}</Text>

          {/* Question */}
          <Text style={styles.lockQuestion}>{questionText}</Text>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              value={response}
              onChangeText={setResponse}
              placeholder="Share your thoughts..."
              multiline
              numberOfLines={3}
              autoFocus
            />
          </View>

          {/* Note */}
          <Text style={styles.lockNote}>{MOTIVATION_PROMPT.note}</Text>
        </Animated.View>

        {/* Bottom buttons */}
        <View style={styles.bottomBar}>
          <Button
            title={`Continue to ${platformName}`}
            onPress={handleSubmit}
            disabled={!response.trim()}
          />
          {onSkip && (
            <Button title="Skip" onPress={onSkip} mode="text" />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  appBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  bigIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: width * 0.85,
  },
  lockQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    maxWidth: width * 0.85,
  },
  inputWrapper: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  lockNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 17,
    maxWidth: width * 0.85,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
});
