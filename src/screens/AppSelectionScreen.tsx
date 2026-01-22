import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Card } from '../components/common';
import { COLORS, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AppSelectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AppSelection'>;
};

export const AppSelectionScreen: React.FC<AppSelectionScreenProps> = ({ navigation }) => {
  const { user, updateSettings } = useStore();
  const [selectedApps, setSelectedApps] = useState<string[]>(
    user?.settings.trackedApps || SOCIAL_MEDIA_APPS.slice(0, 6).map((app) => app.id)
  );

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleContinue = async () => {
    await updateSettings({ trackedApps: selectedApps });
    navigation.navigate('TimeWindow');
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
        <Text style={styles.title}>Select Apps to Track</Text>
        <Text style={styles.subtitle}>
          Choose which social media apps you want us to monitor during the study.
          You can change this later.
        </Text>

        <View style={styles.appsGrid}>
          {SOCIAL_MEDIA_APPS.map((app) => {
            const isSelected = selectedApps.includes(app.id);
            return (
              <TouchableOpacity
                key={app.id}
                style={[styles.appCard, isSelected && styles.appCardSelected]}
                onPress={() => toggleApp(app.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <MaterialCommunityIcons
                    name={getIconName(app.id) as any}
                    size={32}
                    color={isSelected ? '#FFFFFF' : COLORS.textSecondary}
                  />
                </View>
                <Text style={[styles.appName, isSelected && styles.appNameSelected]}>
                  {app.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionCount}>
            {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''} selected
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={selectedApps.length === 0}
          />
          {selectedApps.length === 0 && (
            <Text style={styles.footerNote}>Please select at least one app</Text>
          )}
        </View>
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
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  appCard: {
    width: '45%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  appNameSelected: {
    color: COLORS.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectionInfo: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  selectionCount: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 8,
  },
  footerNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
});
