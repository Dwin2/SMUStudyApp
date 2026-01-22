import React from 'react';
import { StyleSheet } from 'react-native';
import { MotivationPrompt, NeutralPrompt } from '../components/prompts';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { Linking, Platform } from 'react-native';
import { SOCIAL_MEDIA_APPS } from '../constants';

type PromptScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Prompt'>;
  route: RouteProp<RootStackParamList, 'Prompt'>;
};

export const PromptScreen: React.FC<PromptScreenProps> = ({ navigation, route }) => {
  const { platform, sessionId } = route.params;
  const { user, saveMRPResponse, saveNPResponse, recordPromptShown } = useStore();

  const isTreatmentGroup = user?.group === 'treatment';

  const handleMRPSubmit = async (response: string) => {
    await saveMRPResponse(platform, sessionId, response);
    recordPromptShown();
    openTargetApp();
  };

  const handleNPSubmit = async (question: string, response: string) => {
    await saveNPResponse(platform, sessionId, question, response);
    recordPromptShown();
    openTargetApp();
  };

  const handleSkip = () => {
    openTargetApp();
  };

  const openTargetApp = () => {
    // Find the app's URL scheme
    const app = SOCIAL_MEDIA_APPS.find((a) => a.id === platform);
    if (app) {
      // Try to open the app
      Linking.canOpenURL(app.urlScheme).then((supported) => {
        if (supported) {
          Linking.openURL(app.urlScheme);
        }
      });
    }

    // Go back or to home
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

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
