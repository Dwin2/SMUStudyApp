import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Button } from '../components/common';
import { COLORS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TutorialScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tutorial'>;
};

const TOTAL_STEPS = 5;

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoTried, setDemoTried] = useState(false);
  const { updatePhase, startAppSession } = useStore();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    await updatePhase('intervention');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleDemoTap = () => {
    const sessionId = startAppSession('instagram');
    setDemoTried(true);
    navigation.navigate('Prompt', { platform: 'instagram', sessionId, demo: true });
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= currentStep && styles.progressDotActive]}
            />
          ))}
        </View>

        {/* Step content */}
        <View style={styles.stepContent}>
          {currentStep === 0 && <StepOpenFromHere />}
          {currentStep === 1 && (
            <StepDemo demoTried={demoTried} onTryDemo={handleDemoTap} />
          )}
          {currentStep === 2 && <StepPrompts />}
          {currentStep === 3 && <StepSurveys />}
          {currentStep === 4 && <StepDuration />}
        </View>

        {/* Footer buttons */}
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
              title={isLastStep ? 'Start Study' : 'Next'}
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
          {!isLastStep && (
            <Button title="Skip Tutorial" onPress={handleFinish} mode="text" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ── Step components ──────────────────────────────────────────────────────────

function StepOpenFromHere() {
  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="hand-pointing-down" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>Open Apps From Here</Text>
      <Text style={styles.stepDescription}>
        During the 7-day study, always open your social media apps{' '}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>through this app</Text> — not
        directly from your home screen.{'\n\n'}
        The app's home screen has icons for Instagram, TikTok, and more. Tap them here to launch
        the apps.
      </Text>
    </>
  );
}

function StepDemo({
  demoTried,
  onTryDemo,
}: {
  demoTried: boolean;
  onTryDemo: () => void;
}) {
  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="play-circle-outline" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>Try It Now</Text>
      <Text style={styles.stepDescription}>
        Sometimes before opening an app, you'll see a short question. Tap the button below to
        experience it.
      </Text>

      <TouchableOpacity
        style={[styles.demoButton, demoTried && styles.demoButtonDone]}
        onPress={onTryDemo}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="instagram"
          size={28}
          color={demoTried ? COLORS.success ?? '#22c55e' : '#fff'}
        />
        <Text style={[styles.demoButtonText, demoTried && styles.demoButtonTextDone]}>
          {demoTried ? 'Demo complete ✓' : 'Open Instagram (demo)'}
        </Text>
      </TouchableOpacity>

      {demoTried && (
        <Text style={styles.demoNote}>
          That's exactly what it looks like. Tap Next to continue.
        </Text>
      )}
    </>
  );
}

function StepPrompts() {
  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="message-question-outline" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>Quick Prompts</Text>
      <Text style={styles.stepDescription}>
        Not every app open will trigger a question — we'll ask up to{' '}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>15 times per day</Text>, with at
        least 1 hour between prompts.{'\n\n'}
        Just answer honestly. There are no right or wrong answers.
      </Text>
    </>
  );
}

function StepSurveys() {
  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="bell-outline" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>Daily Check-ins</Text>
      <Text style={styles.stepDescription}>
        At{' '}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>5 pm and 9 pm</Text> each day
        you'll get a notification for a brief survey about your social media use and well-being.{'\n\n'}
        These take about 2 minutes each.
      </Text>
    </>
  );
}

function StepDuration() {
  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="calendar-check" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>You're All Set!</Text>
      <Text style={styles.stepDescription}>
        The study runs for{' '}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>7 days</Text>. After that, you'll
        complete a short final survey. We'll also follow up on Day 30.{'\n\n'}
        Tap <Text style={{ fontWeight: '700', color: COLORS.text }}>Start Study</Text> when you're
        ready to begin.
      </Text>
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 24 },
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
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.85,
  },
  // Demo button
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#E1306C', // Instagram brand colour
    borderRadius: 14,
  },
  demoButtonDone: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  demoButtonTextDone: {
    color: '#22c55e',
  },
  demoNote: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Footer
  footer: { paddingTop: 24 },
  buttonRow: { flexDirection: 'row', marginBottom: 8 },
  backButton: { flex: 1, marginRight: 8 },
  nextButton: { flex: 2 },
});
