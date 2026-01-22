import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Button, Card } from '../components/common';
import { COLORS, SOCIAL_MEDIA_APPS, APP_CONFIG } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const TIME_OPTIONS = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
];

const END_TIME_OPTIONS = [
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' },
  { label: '12:00 AM', value: '00:00' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, updateSettings } = useStore();
  const [trackedApps, setTrackedApps] = useState<string[]>(user?.settings.trackedApps || []);
  const [windowStart, setWindowStart] = useState(user?.settings.windowStart || APP_CONFIG.DEFAULT_WINDOW_START);
  const [windowEnd, setWindowEnd] = useState(user?.settings.windowEnd || APP_CONFIG.DEFAULT_WINDOW_END);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleApp = (appId: string) => {
    setTrackedApps((prev) => {
      const newApps = prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId];
      setHasChanges(true);
      return newApps;
    });
  };

  const updateTime = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setWindowStart(value);
    } else {
      setWindowEnd(value);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (trackedApps.length === 0) {
      Alert.alert('Error', 'Please select at least one app to track.');
      return;
    }

    await updateSettings({
      trackedApps,
      windowStart,
      windowEnd,
    });
    setHasChanges(false);
    Alert.alert('Success', 'Settings saved successfully.');
  };

  const handleOpenShortcuts = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('shortcuts://');
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        {/* Participant Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Participant Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Participant ID</Text>
            <Text style={styles.infoValue}>{user?.participantId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Group</Text>
            <Text style={styles.infoValue}>
              {user?.group === 'treatment' ? 'Treatment' : 'Control'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Study Phase</Text>
            <Text style={styles.infoValue}>{user?.studyPhase}</Text>
          </View>
        </Card>

        {/* Tracked Apps */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Tracked Apps</Text>
          <Text style={styles.sectionDescription}>
            Select which apps to monitor during the study.
          </Text>
          <View style={styles.appsGrid}>
            {SOCIAL_MEDIA_APPS.map((app) => {
              const isSelected = trackedApps.includes(app.id);
              return (
                <TouchableOpacity
                  key={app.id}
                  style={[styles.appItem, isSelected && styles.appItemSelected]}
                  onPress={() => toggleApp(app.id)}
                >
                  <MaterialCommunityIcons
                    name={getIconName(app.id) as any}
                    size={24}
                    color={isSelected ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[styles.appName, isSelected && styles.appNameSelected]}>
                    {app.name}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={COLORS.success}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Active Hours */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Active Hours</Text>
          <Text style={styles.sectionDescription}>
            Prompts will only appear during these hours.
          </Text>

          <Text style={styles.timeLabel}>Start Time</Text>
          <View style={styles.timeOptions}>
            {TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeOption,
                  windowStart === option.value && styles.timeOptionSelected,
                ]}
                onPress={() => updateTime('start', option.value)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    windowStart === option.value && styles.timeOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.timeLabel}>End Time</Text>
          <View style={styles.timeOptions}>
            {END_TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeOption,
                  windowEnd === option.value && styles.timeOptionSelected,
                ]}
                onPress={() => updateTime('end', option.value)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    windowEnd === option.value && styles.timeOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* iOS Shortcuts */}
        {Platform.OS === 'ios' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Shortcuts Setup</Text>
            <Text style={styles.sectionDescription}>
              Open the Shortcuts app to manage your automations for app detection.
            </Text>
            <Button
              title="Open Shortcuts"
              mode="outlined"
              onPress={handleOpenShortcuts}
              icon="open-in-new"
            />
          </Card>
        )}

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.saveContainer}>
            <Button title="Save Changes" onPress={handleSave} />
          </View>
        )}

        {/* About */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Social Media Use Study{'\n'}
            Harvard Research Project{'\n'}
            Version 1.0.0
          </Text>
          <Text style={styles.contactText}>
            Questions? Contact:{'\n'}
            yuning_liu@g.harvard.edu{'\n'}
            darwinli@college.harvard.edu
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  appsGrid: {
    flexDirection: 'column',
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.cardBackground,
  },
  appItemSelected: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  appName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 12,
  },
  appNameSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.cardBackground,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  timeOptionText: {
    fontSize: 13,
    color: COLORS.text,
  },
  timeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  saveContainer: {
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
