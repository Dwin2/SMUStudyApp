import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Card, ProgressBar } from '../components/common';
import { COLORS, APP_CONFIG, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// Icon colors per app
const APP_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  youtube: '#FF0000',
  tiktok: '#010101',
  snapchat: '#FFFC00',
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  discord: '#5865F2',
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, sampling, initialize, canShowPrompt, startAppSession } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  };

  const filteredApps = SOCIAL_MEDIA_APPS.filter((app) =>
    user?.settings.trackedApps.includes(app.id)
  );
  // Fall back to all apps so the grid is never empty
  const trackedApps = filteredApps.length > 0 ? filteredApps : SOCIAL_MEDIA_APPS;

  const handleAppTap = (appId: string) => {
    const sessionId = uuidv4();
    startAppSession(appId);

    if (canShowPrompt()) {
      // Show prompt first — PromptScreen will open the real app after
      navigation.navigate('Prompt', { platform: appId, sessionId });
    } else {
      // Sampling rules say skip — open the app directly
      const app = SOCIAL_MEDIA_APPS.find((a) => a.id === appId);
      if (app) {
        Linking.openURL(app.urlScheme).catch(() => {
          // App not installed or URL scheme not supported — do nothing
        });
      }
    }
  };

  const getStudyProgress = () => {
    if (!user?.studyStartDate) return 0;
    const start = new Date(user.studyStartDate);
    const days = Math.floor((Date.now() - start.getTime()) / 86400000);
    return Math.min(days / APP_CONFIG.STUDY_DURATION_DAYS, 1);
  };

  const getDaysRemaining = () => {
    if (!user?.studyStartDate) return APP_CONFIG.STUDY_DURATION_DAYS;
    const start = new Date(user.studyStartDate);
    const days = Math.floor((Date.now() - start.getTime()) / 86400000);
    return Math.max(APP_CONFIG.STUDY_DURATION_DAYS - days, 0);
  };

  const getNextSurveyTime = () => {
    const h = new Date().getHours();
    if (h < 17) return '5:00 PM';
    if (h < 21) return '9:00 PM';
    return 'Tomorrow at 5:00 PM';
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const effectivePromptsToday = sampling.lastResetDate !== todayStr ? 0 : sampling.promptsToday;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello{user?.settings.name ? `, ${user.settings.name}` : ''}!
          </Text>
          <Text style={styles.participantId}>ID: {user?.participantId}</Text>
        </View>

        {/* ── LAUNCH PAD ── primary interaction */}
        <Card style={styles.launchCard}>
          <View style={styles.launchBanner}>
            <MaterialCommunityIcons name="arrow-down-circle" size={18} color={COLORS.primary} />
            <Text style={styles.launchBannerText}>
              Open your apps from HERE — not your home screen
            </Text>
          </View>
          <Text style={styles.launchTitle}>Tap an app to open it</Text>
          <Text style={styles.launchSubtitle}>
            We may ask a quick question before redirecting you.
          </Text>

          <View style={styles.appGrid}>
            {trackedApps.map((app) => {
              const color = APP_COLORS[app.id] ?? COLORS.primary;
              return (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appTile}
                  onPress={() => handleAppTap(app.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.appIcon, { backgroundColor: color }]}>
                    <MaterialCommunityIcons
                      name={app.icon as any}
                      size={28}
                      color={app.id === 'snapchat' ? '#000' : '#fff'}
                    />
                  </View>
                  <Text style={styles.appLabel}>{app.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Study Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Study Progress</Text>
          </View>
          <ProgressBar progress={getStudyProgress()} label="Day Progress" />
          <View style={styles.progressFooter}>
            <Text style={styles.dimText}>
              {getDaysRemaining()} day{getDaysRemaining() !== 1 ? 's' : ''} remaining
            </Text>
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>
                {user?.group === 'treatment' ? 'Treatment' : 'Control'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Today's Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="chart-bar" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Today's Prompts</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{effectivePromptsToday}</Text>
              <Text style={styles.statLabel}>Shown</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.max(APP_CONFIG.MAX_PROMPTS_PER_DAY - effectivePromptsToday, 0)}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
          <ProgressBar
            progress={effectivePromptsToday / APP_CONFIG.MAX_PROMPTS_PER_DAY}
            label={`Daily limit: ${APP_CONFIG.MAX_PROMPTS_PER_DAY}`}
          />
        </Card>

        {/* Next Survey */}
        <Card style={styles.surveyCard}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="bell-outline" size={20} color={COLORS.warning} />
            <Text style={styles.cardTitle}>Next Check-in</Text>
          </View>
          <Text style={styles.surveyTime}>{getNextSurveyTime()}</Text>
          <Text style={styles.dimText}>
            You'll get a notification for your daily check-in surveys.
          </Text>
        </Card>

        {/* Dev panel */}
        <TouchableOpacity
          style={styles.devLink}
          onPress={() => navigation.navigate('Testing')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="flask-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.devLinkText}>Developer Testing Panel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  participantId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },

  // Launch pad
  launchCard: { marginBottom: 14 },
  launchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  launchBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    lineHeight: 18,
  },
  launchTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  launchSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 16,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  appTile: {
    alignItems: 'center',
    width: 68,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  appLabel: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
  },

  // Cards
  progressCard: { marginBottom: 12 },
  statsCard: { marginBottom: 12 },
  surveyCard: { marginBottom: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  groupBadge: {
    backgroundColor: COLORS.primary + '18',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  surveyTime: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 4,
  },
  dimText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },

  devLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
    paddingVertical: 10,
  },
  devLinkText: { fontSize: 12, color: COLORS.textSecondary },
});
