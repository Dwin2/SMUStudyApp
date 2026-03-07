import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../components/common';
import { COLORS, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import { getDeepLinkURL } from '../services/appUsageService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TutorialScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tutorial'>;
};

const TOTAL_STEPS = 3;

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoTried, setDemoTried] = useState(false);
  const { updatePhase, startAppSession, user } = useStore();

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
          {currentStep === 0 && (
            <StepDemo demoTried={demoTried} onTryDemo={handleDemoTap} />
          )}
          {currentStep === 1 && <StepSetup user={user} />}
          {currentStep === 2 && <StepReady />}
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
            <Button title="Skip & Start Study" onPress={handleFinish} mode="text" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ── Step components ──────────────────────────────────────────────────────────

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
        <MaterialCommunityIcons name="instagram" size={64} color="#E1306C" />
      </View>
      <Text style={styles.stepTitle}>How Prompts Work</Text>
      <Text style={styles.stepDescription}>
        When you open Instagram (or any tracked app), a short question will
        automatically pop up before the app opens.{'\n\n'}
        Tap below to see exactly what it looks like.
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
          {demoTried ? 'Demo complete' : 'Try a demo prompt'}
        </Text>
      </TouchableOpacity>

      {demoTried && (
        <Text style={styles.demoNote}>
          That's it! Prompts appear automatically — no extra steps needed.
        </Text>
      )}
    </>
  );
}

function StepSetup({ user }: { user: any }) {
  const [copied, setCopied] = useState(false);

  const trackedApps = SOCIAL_MEDIA_APPS.filter((app) =>
    user?.settings.trackedApps.includes(app.id)
  );
  const displayApps = trackedApps.length > 0 ? trackedApps : SOCIAL_MEDIA_APPS.slice(0, 4);

  const handleCopyURL = async (appId: string) => {
    const url = getDeepLinkURL(appId);
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenShortcuts = () => {
    Linking.openURL('shortcuts://');
  };

  if (Platform.OS !== 'ios') {
    return (
      <>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle" size={64} color={COLORS.success ?? '#22c55e'} />
        </View>
        <Text style={styles.stepTitle}>Automatic Detection</Text>
        <Text style={styles.stepDescription}>
          On Android, the app automatically detects when you open social media.
          {'\n\n'}
          Just use Instagram and your other apps normally — prompts will appear
          automatically.
        </Text>
      </>
    );
  }

  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="apple" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>One-Time Setup</Text>
      <Text style={styles.stepDescription}>
        To get prompts automatically, set up a quick iOS Shortcut for each app.
        This lets prompts appear when you open Instagram normally — no need to
        launch it from here.
      </Text>

      <View style={styles.setupInstructions}>
        <Text style={styles.setupStep}>1. Open the <Text style={{ fontWeight: '700' }}>Shortcuts</Text> app</Text>
        <Text style={styles.setupStep}>2. Go to <Text style={{ fontWeight: '700' }}>Automation</Text> → tap <Text style={{ fontWeight: '700' }}>+</Text></Text>
        <Text style={styles.setupStep}>3. Choose <Text style={{ fontWeight: '700' }}>App</Text> → select the app (e.g. Instagram)</Text>
        <Text style={styles.setupStep}>4. Add action: <Text style={{ fontWeight: '700' }}>Open URL</Text></Text>
        <Text style={styles.setupStep}>5. Paste the URL below → turn off "Ask Before Running"</Text>
      </View>

      <View style={styles.urlList}>
        {displayApps.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={styles.urlRow}
            onPress={() => handleCopyURL(app.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.urlAppName}>{app.name}:</Text>
            <Text style={styles.urlText} numberOfLines={1}>{getDeepLinkURL(app.id)}</Text>
            <MaterialCommunityIcons
              name={copied ? 'check' : 'content-copy'}
              size={16}
              color={copied ? (COLORS.success ?? '#22c55e') : COLORS.primary}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Open Shortcuts App"
        onPress={handleOpenShortcuts}
        icon="open-in-new"
        mode="outlined"
        style={styles.shortcutsButton}
      />
    </>
  );
}

function StepReady() {
  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="calendar-check" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>You're All Set!</Text>
      <Text style={styles.stepDescription}>
        The study runs for{' '}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>7 days</Text>. Here's what
        to expect:{'\n\n'}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>Prompts</Text> — Up to 15
        per day when you open social media, with at least 1 hour between each.{'\n\n'}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>Check-ins</Text> — Brief
        surveys at 5 PM and 9 PM daily.{'\n\n'}
        Tap{' '}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>Start Study</Text> when
        you're ready.
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
    backgroundColor: '#E1306C',
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
  // Setup instructions
  setupInstructions: {
    alignSelf: 'stretch',
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  setupStep: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 22,
  },
  urlList: {
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 6,
  },
  urlAppName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    width: 72,
  },
  urlText: {
    flex: 1,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.primary,
  },
  shortcutsButton: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  // Footer
  footer: { paddingTop: 24 },
  buttonRow: { flexDirection: 'row', marginBottom: 8 },
  backButton: { flex: 1, marginRight: 8 },
  nextButton: { flex: 2 },
});
