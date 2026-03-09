import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Linking,
  TouchableOpacity,
  ScrollView,
  Alert,
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

// Steps: 0 = Demo, 1..N = one per tracked app (Shortcuts setup), N+1 = Ready
export const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const { updatePhase, startAppSession, user } = useStore();

  const trackedApps = SOCIAL_MEDIA_APPS.filter((app) =>
    user?.settings.trackedApps.includes(app.id)
  );

  // Total steps: demo + one per tracked app + ready
  const TOTAL_STEPS = 1 + trackedApps.length + 1;

  const [currentStep, setCurrentStep] = useState(0);
  const [demoTried, setDemoTried] = useState(false);
  const [completedApps, setCompletedApps] = useState<Set<string>>(new Set());

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

  const markAppDone = useCallback((appId: string) => {
    setCompletedApps((prev) => new Set(prev).add(appId));
  }, []);

  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isAppStep = currentStep >= 1 && currentStep < TOTAL_STEPS - 1;
  const currentApp = isAppStep ? trackedApps[currentStep - 1] : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          Step {currentStep + 1} of {TOTAL_STEPS}
        </Text>

        {/* Step content */}
        <ScrollView
          style={styles.stepScroll}
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 0 && (
            <StepDemo demoTried={demoTried} onTryDemo={handleDemoTap} />
          )}
          {isAppStep && currentApp && (
            <StepAppSetup
              app={currentApp}
              isDone={completedApps.has(currentApp.id)}
              onMarkDone={() => markAppDone(currentApp.id)}
            />
          )}
          {isLastStep && (
            <StepReady
              completedCount={completedApps.size}
              totalCount={trackedApps.length}
            />
          )}
        </ScrollView>

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

// ── Step 0: Demo ─────────────────────────────────────────────────────────────

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
        <MaterialCommunityIcons name="cellphone-check" size={56} color={COLORS.primary} />
      </View>
      <Text style={styles.stepTitle}>How Prompts Work</Text>
      <Text style={styles.stepDescription}>
        During the study, a short question will appear{' '}
        <Text style={{ fontWeight: '700' }}>before</Text> your social media app opens
        — right on your home screen, just like normal.{'\n\n'}
        Tap below to preview what the prompt looks like.
      </Text>

      <TouchableOpacity
        style={[styles.demoButton, demoTried && styles.demoButtonDone]}
        onPress={onTryDemo}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="play-circle-outline"
          size={28}
          color={demoTried ? COLORS.success ?? '#22c55e' : '#fff'}
        />
        <Text style={[styles.demoButtonText, demoTried && styles.demoButtonTextDone]}>
          {demoTried ? 'Demo complete' : 'Try a demo prompt'}
        </Text>
      </TouchableOpacity>

      {demoTried && (
        <Text style={styles.demoNote}>
          Great! Next, we'll set up each of your apps so prompts appear automatically
          when you open them from your home screen.
        </Text>
      )}
    </>
  );
}

// ── Per-app Shortcuts setup step ─────────────────────────────────────────────

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
  tiktok: '#000000',
  snapchat: '#FFFC00',
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  discord: '#5865F2',
};

function StepAppSetup({
  app,
  isDone,
  onMarkDone,
}: {
  app: (typeof SOCIAL_MEDIA_APPS)[number];
  isDone: boolean;
  onMarkDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const deepLinkURL = getDeepLinkURL(app.id);
  const appColor = APP_COLORS[app.id] || COLORS.primary;

  const handleCopyURL = async () => {
    await Clipboard.setStringAsync(deepLinkURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenShortcuts = () => {
    Linking.openURL('shortcuts://create-automation');
  };

  const handleMarkDone = () => {
    onMarkDone();
    Alert.alert(
      `${app.name} is set up!`,
      `Prompts will now appear automatically when you open ${app.name} from your home screen.`
    );
  };

  if (Platform.OS !== 'ios') {
    return (
      <>
        <View style={[styles.iconContainer, { backgroundColor: appColor + '15' }]}>
          <MaterialCommunityIcons
            name={ICON_MAP[app.id] as any ?? 'application'}
            size={56}
            color={appColor}
          />
        </View>
        <Text style={styles.stepTitle}>{app.name}</Text>
        <Text style={styles.stepDescription}>
          On Android, {app.name} is detected automatically. No setup needed!
        </Text>
        {!isDone && (
          <TouchableOpacity style={styles.doneButton} onPress={onMarkDone} activeOpacity={0.8}>
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
            <Text style={styles.doneButtonText}>Got it</Text>
          </TouchableOpacity>
        )}
        {isDone && <DoneBadge appName={app.name} />}
      </>
    );
  }

  // iOS guided setup
  const steps = [
    {
      title: 'Copy the link below',
      detail: 'This special link tells our app which platform you opened.',
      action: (
        <TouchableOpacity style={styles.urlCopyRow} onPress={handleCopyURL} activeOpacity={0.7}>
          <Text style={styles.urlText} numberOfLines={1}>{deepLinkURL}</Text>
          <View style={[styles.copyBadge, copied && styles.copyBadgeDone]}>
            <MaterialCommunityIcons
              name={copied ? 'check' : 'content-copy'}
              size={16}
              color={copied ? '#fff' : COLORS.primary}
            />
            <Text style={[styles.copyBadgeText, copied && styles.copyBadgeTextDone]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    },
    {
      title: 'Open the Shortcuts app',
      detail: 'Tap the button below to jump straight to Shortcuts.',
      action: (
        <Button
          title="Open Shortcuts"
          onPress={handleOpenShortcuts}
          icon="open-in-new"
          mode="outlined"
          style={{ marginTop: 8 }}
        />
      ),
    },
    {
      title: 'Create a new Automation',
      detail: `Tap the Automation tab → tap + → choose "App" → select "${app.name}" → make sure "Is Opened" is checked → tap Next.`,
    },
    {
      title: 'Add the "Open URL" action',
      detail: `Tap "New Blank Automation" → tap "Add Action" → search for "Open URL" → tap the blue "URL" text and paste the link you copied in step 1.`,
    },
    {
      title: 'Turn off "Ask Before Running"',
      detail: `Tap "Done" in the top right. When asked, turn OFF "Ask Before Running" so the prompt appears instantly. Then tap "Done" again.`,
    },
  ];

  return (
    <>
      {/* App header */}
      <View style={[styles.iconContainer, { backgroundColor: appColor + '15' }]}>
        <MaterialCommunityIcons
          name={ICON_MAP[app.id] as any ?? 'application'}
          size={56}
          color={appColor}
        />
      </View>
      <Text style={styles.stepTitle}>Set up {app.name}</Text>
      <Text style={styles.stepDescription}>
        Follow these steps to create a Shortcut so prompts appear when you open{' '}
        {app.name} from your home screen.
      </Text>

      {/* Numbered steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, i) => (
          <TouchableOpacity
            key={i}
            style={styles.stepRow}
            onPress={() => setExpandedStep(expandedStep === i ? null : i)}
            activeOpacity={0.7}
          >
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepRowTitle}>{step.title}</Text>
              {(expandedStep === i || i <= 1) && (
                <>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                  {step.action && <View style={styles.stepAction}>{step.action}</View>}
                </>
              )}
              {expandedStep !== i && i > 1 && (
                <Text style={styles.tapToExpand}>Tap to expand</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mark done */}
      {!isDone ? (
        <TouchableOpacity style={styles.doneButton} onPress={handleMarkDone} activeOpacity={0.8}>
          <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
          <Text style={styles.doneButtonText}>I've finished setting up {app.name}</Text>
        </TouchableOpacity>
      ) : (
        <DoneBadge appName={app.name} />
      )}
    </>
  );
}

function DoneBadge({ appName }: { appName: string }) {
  return (
    <View style={styles.doneBadge}>
      <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.success ?? '#22c55e'} />
      <Text style={styles.doneBadgeText}>{appName} is set up</Text>
    </View>
  );
}

// ── Final step: Ready ────────────────────────────────────────────────────────

function StepReady({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  const allDone = completedCount === totalCount;
  return (
    <>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={allDone ? 'calendar-check' : 'alert-circle-outline'}
          size={56}
          color={allDone ? COLORS.primary : COLORS.warning}
        />
      </View>
      <Text style={styles.stepTitle}>
        {allDone ? "You're All Set!" : 'Almost There'}
      </Text>

      {!allDone && (
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.warning} />
          <Text style={styles.warningText}>
            You set up {completedCount} of {totalCount} apps. You can go back to finish the rest,
            or continue and set them up later in Settings.
          </Text>
        </View>
      )}

      <Text style={styles.stepDescription}>
        The study runs for{' '}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>7 days</Text>. Here's what
        to expect:{'\n\n'}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>Use apps normally</Text> — Open
        Instagram, TikTok, etc. from your home screen as you always do. A brief
        prompt will appear automatically before the app opens.{'\n\n'}
        <Text style={{ fontWeight: '700', color: COLORS.text }}>Prompts</Text> — Up to 15
        per day, with at least 1 hour between each.{'\n\n'}
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

  // Progress bar
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: 16,
  },

  // Scroll area
  stepScroll: { flex: 1 },
  stepContent: {
    alignItems: 'center',
    paddingBottom: 24,
  },

  // Icon container
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.88,
  },

  // Demo button
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: COLORS.primary,
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
    lineHeight: 20,
    maxWidth: width * 0.85,
  },

  // Per-app setup steps
  stepsContainer: {
    alignSelf: 'stretch',
    marginTop: 20,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 14,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepInfo: {
    flex: 1,
  },
  stepRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  stepAction: {
    marginTop: 8,
  },
  tapToExpand: {
    fontSize: 11,
    color: COLORS.primary,
    fontStyle: 'italic',
  },

  // URL copy row
  urlCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    marginTop: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.primary,
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '12',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copyBadgeDone: {
    backgroundColor: COLORS.success ?? '#22c55e',
  },
  copyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  copyBadgeTextDone: {
    color: '#fff',
  },

  // Done button & badge
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.success ?? '#22c55e',
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  doneBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success ?? '#22c55e',
  },

  // Warning box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    maxWidth: width * 0.88,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#7B6C00',
    lineHeight: 19,
  },

  // Footer
  footer: { paddingTop: 16 },
  buttonRow: { flexDirection: 'row', marginBottom: 8 },
  backButton: { flex: 1, marginRight: 8 },
  nextButton: { flex: 2 },
});
