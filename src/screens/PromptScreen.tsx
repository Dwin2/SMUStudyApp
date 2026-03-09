import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { MotivationPrompt, NeutralPrompt } from '../components/prompts';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { Linking } from 'react-native';
import { SOCIAL_MEDIA_APPS, COLORS } from '../constants';

type PromptScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Prompt'>;
  route: RouteProp<RootStackParamList, 'Prompt'>;
};

export const PromptScreen: React.FC<PromptScreenProps> = ({ navigation, route }) => {
  const { platform, sessionId, demo } = route.params;
  const { user, isLoading, saveMRPResponse, saveNPResponse, recordPromptShown, canShowPrompt, startAppSession } = useStore();
  const initDone = useRef(false);

  const isTreatmentGroup = user?.group === 'treatment';

  // Wait for user to load before evaluating sampling rules
  useEffect(() => {
    if (isLoading || initDone.current) return;
    initDone.current = true;

    const shouldShow = demo ? true : canShowPrompt();

    // Register the session if opened via deep link
    if (!demo) {
      startAppSession(platform);
    }

    if (!shouldShow) {
      // Sampling rules say skip — open the target app directly without a prompt
      openTargetApp();
    } else if (!demo) {
      // Record the prompt as "sent" immediately (per study design: max 15 sent, not answered)
      recordPromptShown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleMRPSubmit = async (response: string) => {
    if (!demo) await saveMRPResponse(platform, sessionId, response);
    openTargetApp();
  };

  const handleNPSubmit = async (question: string, response: string) => {
    if (!demo) await saveNPResponse(platform, sessionId, question, response);
    openTargetApp();
  };

  const handleSkip = () => {
    openTargetApp();
  };

  const openTargetApp = () => {
    if (!demo) {
      // Live mode — actually open the real app
      const app = SOCIAL_MEDIA_APPS.find((a) => a.id === platform);
      if (app) {
        Linking.canOpenURL(app.urlScheme).then((supported) => {
          if (supported) Linking.openURL(app.urlScheme);
        });
      }
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  // Still loading — show a brief spinner so the deep link isn't lost
  if (isLoading || !initDone.current) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isTreatmentGroup) {
    return (
      <MotivationPrompt
        platform={platform}
        onSubmit={handleMRPSubmit}
        onSkip={handleSkip}
      />
    );
  }

  return (
    <NeutralPrompt
      platform={platform}
      onSubmit={handleNPSubmit}
      onSkip={handleSkip}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
