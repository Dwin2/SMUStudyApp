import React from 'react';
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
  const { saveSatisfactionResponse, endAppSession } = useStore();

  const handleSubmit = async (satisfaction: string) => {
    await saveSatisfactionResponse(platform, sessionId, satisfaction);
    endAppSession(sessionId);

    // Navigate back
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return <SatisfactionPrompt platform={platform} onSubmit={handleSubmit} />;
};

const styles = StyleSheet.create({});
