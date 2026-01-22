import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { Button, Card, ProgressBar } from '../components/common';
import { COLORS, APP_CONFIG, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, sampling, initialize } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  };

  // Calculate study progress
  const getStudyProgress = () => {
    if (!user?.studyStartDate) return 0;
    const startDate = new Date(user.studyStartDate);
    const today = new Date();
    const daysPassed = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(daysPassed / APP_CONFIG.STUDY_DURATION_DAYS, 1);
  };

  const getDaysRemaining = () => {
    if (!user?.studyStartDate) return APP_CONFIG.STUDY_DURATION_DAYS;
    const startDate = new Date(user.studyStartDate);
    const today = new Date();
    const daysPassed = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(APP_CONFIG.STUDY_DURATION_DAYS - daysPassed, 0);
  };

  const getTrackedAppNames = () => {
    return user?.settings.trackedApps
      .map((id) => SOCIAL_MEDIA_APPS.find((app) => app.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getNextSurveyTime = () => {
    const now = new Date();
    const hours = now.getHours();
    if (hours < 17) return '5:00 PM';
    if (hours < 21) return '9:00 PM';
    return 'Tomorrow at 5:00 PM';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.participantId}>ID: {user?.participantId}</Text>
        </View>

        {/* Study Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Study Progress</Text>
          </View>
          <ProgressBar progress={getStudyProgress()} label="Day Progress" />
          <View style={styles.progressInfo}>
            <Text style={styles.daysRemaining}>
              {getDaysRemaining()} day{getDaysRemaining() !== 1 ? 's' : ''} remaining
            </Text>
            <Text style={styles.groupBadge}>
              {user?.group === 'treatment' ? 'Treatment' : 'Control'} Group
            </Text>
          </View>
        </Card>

        {/* Today's Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="chart-bar" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Today's Activity</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sampling.promptsToday}</Text>
              <Text style={styles.statLabel}>Prompts Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{APP_CONFIG.MAX_PROMPTS_PER_DAY - sampling.promptsToday}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
          <ProgressBar
            progress={sampling.promptsToday / APP_CONFIG.MAX_PROMPTS_PER_DAY}
            label="Daily Limit"
          />
        </Card>

        {/* Next Survey Card */}
        <Card style={styles.surveyCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.warning} />
            <Text style={styles.cardTitle}>Next Survey</Text>
          </View>
          <Text style={styles.surveyTime}>{getNextSurveyTime()}</Text>
          <Text style={styles.surveyNote}>
            You'll receive a notification when it's time for your check-in.
          </Text>
        </Card>

        {/* Tracked Apps Card */}
        <Card style={styles.appsCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="apps" size={24} color={COLORS.secondary} />
            <Text style={styles.cardTitle}>Tracked Apps</Text>
          </View>
          <Text style={styles.appsList}>{getTrackedAppNames()}</Text>
          <Button
            title="Manage Apps"
            mode="text"
            onPress={() => navigation.navigate('Settings')}
          />
        </Card>

        {/* Active Hours Card */}
        <Card style={styles.hoursCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.textSecondary} />
            <Text style={styles.cardTitle}>Active Hours</Text>
          </View>
          <Text style={styles.hoursText}>
            {user?.settings.windowStart} - {user?.settings.windowEnd}
          </Text>
          <Text style={styles.hoursNote}>
            Prompts will only appear during these hours.
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  participantId: {
    fontSize: 14,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressCard: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  daysRemaining: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  groupBadge: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  surveyCard: {
    marginBottom: 12,
  },
  surveyTime: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 4,
  },
  surveyNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  appsCard: {
    marginBottom: 12,
  },
  appsList: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  hoursCard: {
    marginBottom: 12,
  },
  hoursText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  hoursNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
