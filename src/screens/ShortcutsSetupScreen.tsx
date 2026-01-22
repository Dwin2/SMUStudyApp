import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { Button, Card } from '../components/common';
import { COLORS, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import { getIOSShortcutsInstructions } from '../services/appUsageService';
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

  const trackedApps = SOCIAL_MEDIA_APPS.filter((app) =>
    user?.settings.trackedApps.includes(app.id)
  );

  const currentApp = trackedApps[currentAppIndex];

  const handleOpenShortcuts = () => {
    Linking.openURL('shortcuts://');
  };

  const handleMarkComplete = () => {
    if (currentApp && !completedApps.includes(currentApp.id)) {
      setCompletedApps([...completedApps, currentApp.id]);
    }

    if (currentAppIndex < trackedApps.length - 1) {
      setCurrentAppIndex(currentAppIndex + 1);
    }
  };

  const handleSkip = () => {
    if (currentAppIndex < trackedApps.length - 1) {
      setCurrentAppIndex(currentAppIndex + 1);
    }
  };

  const handleFinish = () => {
    navigation.navigate('Tutorial');
  };

  const isLastApp = currentAppIndex === trackedApps.length - 1;
  const allComplete = completedApps.length === trackedApps.length;

  const instructions = currentApp ? getIOSShortcutsInstructions(currentApp.name) : [];

  if (Platform.OS !== 'ios') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.androidMessage}>
          <MaterialCommunityIcons name="check-circle" size={64} color={COLORS.success} />
          <Text style={styles.androidTitle}>All Set!</Text>
          <Text style={styles.androidText}>
            Android devices automatically detect when you open social media apps.
            No additional setup is required.
          </Text>
          <Button title="Continue" onPress={handleFinish} style={styles.androidButton} />
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
            Set up {currentAppIndex + 1} of {trackedApps.length}
          </Text>
        </View>

        {/* Progress indicators */}
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
            {/* Current App Card */}
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

            {/* Instructions */}
            <Card style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Follow these steps:</Text>
              {instructions.map((instruction, index) => (
                <Text key={index} style={styles.instruction}>
                  {instruction}
                </Text>
              ))}
            </Card>

            {/* Open Shortcuts Button */}
            <Button
              title="Open Shortcuts App"
              onPress={handleOpenShortcuts}
              icon="open-in-new"
              style={styles.openButton}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Skip This App"
                onPress={handleSkip}
                mode="outlined"
                style={styles.skipButton}
              />
              <Button
                title={isLastApp ? 'Finish Setup' : "Done, Next App"}
                onPress={isLastApp && allComplete ? handleFinish : handleMarkComplete}
                style={styles.nextButton}
              />
            </View>
          </>
        )}

        {/* Skip All Option */}
        <Button
          title="Skip All & Continue"
          onPress={handleFinish}
          mode="text"
          style={styles.skipAllButton}
        />

        <Text style={styles.noteText}>
          Note: You can always set up these automations later from the Settings screen.
          The app will still work, but you'll need to manually open it before using social media.
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
    marginBottom: 16,
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
  instructionsCard: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 2,
  },
  openButton: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skipButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 2,
  },
  skipAllButton: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  androidMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  androidTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
  },
  androidText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  androidButton: {
    minWidth: 200,
  },
});
