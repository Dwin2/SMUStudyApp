import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SatisfactionPrompt } from '../components/prompts';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

type SatisfactionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Satisfaction'>;
  route: RouteProp<RootStackParamList, 'Satisfaction'>;
};

export const SatisfactionScreen: React.FC<SatisfactionScreenProps> = ({
  navigation,
  route,
}) => {
  const { platform, sessionId } = route.params;
  const { saveSatisfactionResponse, endAppSession, getActiveSession } = useStore();

  // Only show satisfaction survey if a prompt was shown during this session
  const session = getActiveSession(platform);
  const promptWasShown = useRef(session?.promptShown ?? false).current;

  useEffect(() => {
    if (!promptWasShown) {
      // No prompt was shown — end the session silently and navigate away
      endAppSession(sessionId);
      dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleSubmit = async (satisfaction: string) => {
    await saveSatisfactionResponse(platform, sessionId, satisfaction);
    endAppSession(sessionId);
    dismiss();
  };

  if (!promptWasShown) {
    return null;
  }

  return <SatisfactionPrompt platform={platform} onSubmit={handleSubmit} />;
};

const styles = StyleSheet.create({});
