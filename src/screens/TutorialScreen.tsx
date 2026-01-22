import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Dimensions } from 'react-native';
import { Button } from '../components/common';
import { COLORS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TutorialScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tutorial'>;
};

const TUTORIAL_STEPS = [
  {
    icon: 'cellphone',
    title: 'App Detection',
    description: Platform.OS === 'ios'
      ? "When you open a tracked social media app, you'll be briefly redirected here to answer a quick question."
      : "We'll detect when you open a tracked social media app and show you a brief prompt.",
  },
  {
    icon: 'message-question-outline',
    title: 'Quick Prompts',
    description:
      "You'll see a short question asking you to reflect on why you're opening the app. Just answer honestly - there are no right or wrong answers.",
  },
  {
    icon: 'emoticon-outline',
    title: 'Satisfaction Check',
    description:
      "When you finish using the app, we'll ask how satisfied you were with your experience. Just tap one of three options.",
  },
  {
    icon: 'bell-outline',
    title: 'Daily Surveys',
    description:
      "At 5pm and 9pm, you'll receive a notification to complete a brief survey about your social media use and well-being.",
  },
  {
    icon: 'calendar-check',
    title: '7-Day Study',
    description:
      "The main study lasts 7 days. After that, you'll complete a final survey. We'll also check in with you on Day 30.",
  },
];

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { updatePhase } = useStore();

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    await updatePhase('intervention');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.stepContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={step.icon as any}
              size={64}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <Button
                title="Back"
                onPress={handleBack}
                mode="outlined"
                style={styles.backButton}
              />
            )}
            <Button
              title={isLastStep ? "Start Study" : "Next"}
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>

          {!isLastStep && (
            <Button
              title="Skip Tutorial"
              onPress={handleFinish}
              mode="text"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: width * 0.85,
  },
  footer: {
    paddingTop: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 2,
  },
});
