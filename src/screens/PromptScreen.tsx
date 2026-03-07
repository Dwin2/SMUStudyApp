import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { MotivationPrompt, NeutralPrompt } from '../components/prompts';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { Linking } from 'react-native';
import { SOCIAL_MEDIA_APPS } from '../constants';

type PromptScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Prompt'>;
  route: RouteProp<RootStackParamList, 'Prompt'>;
};

export const PromptScreen: React.FC<PromptScreenProps> = ({ navigation, route }) => {
  const { platform, sessionId, demo } = route.params;
  const { user, saveMRPResponse, saveNPResponse, recordPromptShown, canShowPrompt, startAppSession } = useStore();

  const isTreatmentGroup = user?.group === 'treatment';
  // Demo mode always shows; live mode checks sampling rules once on mount
  const shouldShow = useRef(demo ? true : canShowPrompt()).current;

  useEffect(() => {
    // Register the session if opened via deep link (startAppSession wasn't called)
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
  }, []);

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

  if (!shouldShow) {
    return null;
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

const styles = StyleSheet.create({});
