import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Button, Card } from '../components/common';
import { COLORS, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import { getIOSShortcutsInstructions, getDeepLinkURL } from '../services/appUsageService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ShortcutsSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tutorial'>;
};

export const ShortcutsSetupScreen: React.FC<ShortcutsSetupScreenProps> = ({ navigation }) => {
  const { user } = useStore();
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [completedApps, setCompletedApps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const trackedApps = SOCIAL_MEDIA_APPS.filter((app) =>
    user?.settings.trackedApps.includes(app.id)
  );

  const currentApp = trackedApps[currentAppIndex];

  const handleCopyURL = async () => {
    if (!currentApp) return;
    const url = getDeepLinkURL(currentApp.id);
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenShortcuts = () => {
    Linking.openURL('shortcuts://');
  };

  const handleMarkComplete = () => {
    if (currentApp && !completedApps.includes(currentApp.id)) {
      setCompletedApps([...completedApps, currentApp.id]);
    }
    if (currentAppIndex < trackedApps.length - 1) {
      setCurrentAppIndex(currentAppIndex + 1);
      setCopied(false);
    }
  };

  const handleSkip = () => {
    if (currentAppIndex < trackedApps.length - 1) {
      setCurrentAppIndex(currentAppIndex + 1);
      setCopied(false);
    }
  };

  const handleFinish = () => {
    navigation.navigate('Tutorial');
  };

  const isLastApp = currentAppIndex === trackedApps.length - 1;

  const instructions = currentApp
    ? getIOSShortcutsInstructions(currentApp.name, currentApp.id)
    : [];

  if (Platform.OS !== 'ios') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMessage}>
          <MaterialCommunityIcons name="check-circle" size={64} color={COLORS.success} />
          <Text style={styles.centeredTitle}>All Set!</Text>
          <Text style={styles.centeredText}>
            Android devices automatically detect when you open social media apps.
            No additional setup is required.
          </Text>
          <Button title="Continue" onPress={handleFinish} style={styles.centeredButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Shortcuts Setup</Text>
          <Text style={styles.subtitle}>
            App {currentAppIndex + 1} of {trackedApps.length}
          </Text>
        </View>

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {trackedApps.map((app, index) => (
            <View
              key={app.id}
              style={[
                styles.progressDot,
                index === currentAppIndex && styles.progressDotActive,
                completedApps.includes(app.id) && styles.progressDotComplete,
              ]}
            />
          ))}
        </View>

        {currentApp && (
          <>
            {/* Current App */}
            <Card style={styles.appCard}>
              <View style={styles.appHeader}>
                <View style={styles.appIconContainer}>
                  <MaterialCommunityIcons
                    name={getIconName(currentApp.id) as any}
                    size={32}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.appName}>{currentApp.name}</Text>
              </View>
            </Card>

            {/* URL to copy — the critical step */}
            <Card style={styles.urlCard}>
              <Text style={styles.urlLabel}>Step 9 — Copy this URL into the shortcut:</Text>
              <View style={styles.urlRow}>
                <Text style={styles.urlText} selectable>
                  {getDeepLinkURL(currentApp.id)}
                </Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copied && styles.copyBtnDone]}
                  onPress={handleCopyURL}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={copied ? 'check' : 'content-copy'}
                    size={16}
                    color={copied ? COLORS.success : COLORS.primary}
                  />
                  <Text style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.urlWarning}>
                ⚠️  Use the "Open URL" action — NOT "Open App". "Open App" won't pass this address and nothing will happen when you open {currentApp.name}.
              </Text>
            </Card>

            {/* Step-by-step instructions */}
            <Card style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Full setup steps:</Text>
              {instructions.map((step, index) => (
                <Text key={index} style={styles.instructionLine}>
                  {step}
                </Text>
              ))}
            </Card>

            <Button
              title="Open Shortcuts App"
              onPress={handleOpenShortcuts}
              icon="open-in-new"
              style={styles.openButton}
            />

            <View style={styles.actionButtons}>
              <Button
                title="Skip This App"
                onPress={isLastApp ? handleFinish : handleSkip}
                mode="outlined"
                style={styles.skipButton}
              />
              <Button
                title={isLastApp ? 'Finish Setup' : 'Done, Next →'}
                onPress={isLastApp ? handleFinish : handleMarkComplete}
                style={styles.nextButton}
              />
            </View>
          </>
        )}

        <Button
          title="Skip All & Continue"
          onPress={handleFinish}
          mode="text"
          style={styles.skipAllButton}
        />

        <Text style={styles.noteText}>
          You can set up these automations later from Settings too.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const getIconName = (appId: string): string => {
  const iconMap: Record<string, string> = {
    facebook: 'facebook',
    instagram: 'instagram',
    youtube: 'youtube',
    tiktok: 'music-note',
    snapchat: 'snapchat',
    twitter: 'twitter',
    whatsapp: 'whatsapp',
    discord: 'discord',
  };
  return iconMap[appId] || 'application';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  progressDotComplete: {
    backgroundColor: COLORS.success,
  },
  appCard: {
    marginBottom: 12,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
  },
  urlCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
  },
  urlLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.primary,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  copyBtnDone: {
    borderColor: COLORS.success,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  copyBtnTextDone: {
    color: COLORS.success,
  },
  urlWarning: {
    fontSize: 12,
    color: COLORS.warning ?? '#f59e0b',
    lineHeight: 17,
  },
  instructionsCard: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  instructionLine: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 22,
  },
  openButton: {
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  skipAllButton: {
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  centeredTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
  },
  centeredText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  centeredButton: {
    minWidth: 200,
  },
});
