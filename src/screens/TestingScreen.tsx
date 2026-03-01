import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { COLORS, APP_CONFIG, SOCIAL_MEDIA_APPS } from '../constants';
import { Card, Button } from '../components/common';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { v4 as uuidv4 } from 'uuid';

type TestingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Testing'>;
};

export const TestingScreen: React.FC<TestingScreenProps> = ({ navigation }) => {
  const {
    user,
    sampling,
    canShowPrompt,
    recordPromptShown,
    resetDailySampling,
    startAppSession,
    getActiveSession,
  } = useStore();

  const [lastDecision, setLastDecision] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isNewDay = sampling.lastResetDate !== todayStr;

  const effectivePromptsToday = isNewDay ? 0 : sampling.promptsToday;
  const promptsRemaining = APP_CONFIG.MAX_PROMPTS_PER_DAY - effectivePromptsToday;

  const getMinsSinceLastPrompt = (): string => {
    if (!sampling.lastPromptTime || isNewDay) return 'N/A (no prompts yet today)';
    const ms = Date.now() - new Date(sampling.lastPromptTime).getTime();
    const mins = Math.floor(ms / 60000);
    return `${mins} min ago`;
  };

  const getTimeUntilNextAllowed = (): string => {
    if (!sampling.lastPromptTime || isNewDay) return 'Now';
    const ms = Date.now() - new Date(sampling.lastPromptTime).getTime();
    const minInterval = APP_CONFIG.MIN_HOURS_BETWEEN_PROMPTS * 60 * 60 * 1000;
    const remaining = minInterval - ms;
    if (remaining <= 0) return 'Now';
    const mins = Math.ceil(remaining / 60000);
    return `${mins} min`;
  };

  const isInActiveWindow = (): boolean => {
    if (!user) return false;
    const now = new Date();
    const cur = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    return cur >= user.settings.windowStart && cur <= user.settings.windowEnd;
  };

  const simulateAppOpen = (appId: string) => {
    const sessionId = uuidv4();
    startAppSession(appId);

    const eligible = canShowPrompt();
    const decision = eligible
      ? `PROMPT SHOWN for ${appId} (session: ${sessionId.slice(0, 8)}...)`
      : `SKIPPED for ${appId} — sampling rules blocked it`;

    setLastDecision(decision);

    if (eligible) {
      navigation.navigate('Prompt', { platform: appId, sessionId });
    } else {
      Alert.alert(
        'Prompt Skipped',
        `No prompt shown for ${appId}.\n\nReason: ${getSamplingBlockReason()}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getSamplingBlockReason = (): string => {
    if (!user) return 'No user loaded';

    const todayStr = new Date().toISOString().slice(0, 10);
    const effectiveCount = sampling.lastResetDate !== todayStr ? 0 : sampling.promptsToday;

    if (effectiveCount >= APP_CONFIG.MAX_PROMPTS_PER_DAY) {
      return `Daily limit reached (${APP_CONFIG.MAX_PROMPTS_PER_DAY}/day)`;
    }

    if (!isInActiveWindow()) {
      return `Outside active window (${user.settings.windowStart}–${user.settings.windowEnd})`;
    }

    if (sampling.lastPromptTime && sampling.lastResetDate === todayStr) {
      const ms = Date.now() - new Date(sampling.lastPromptTime).getTime();
      const minInterval = APP_CONFIG.MIN_HOURS_BETWEEN_PROMPTS * 60 * 60 * 1000;
      if (ms < minInterval) {
        const mins = Math.ceil((minInterval - ms) / 60000);
        return `Must wait ${mins} more min (1-hour cooldown)`;
      }
    }

    return 'Unknown';
  };

  const simulateSatisfactionSurvey = (appId: string) => {
    const session = getActiveSession(appId);
    if (!session) {
      Alert.alert('No active session', `Open ${appId} first using "Simulate App Open".`);
      return;
    }
    navigation.navigate('Satisfaction', { platform: appId, sessionId: session.id });
  };

  const triggerScheduledSurvey = (time: '5pm' | '9pm') => {
    navigation.navigate('ScheduledSurvey', { surveyTime: time });
  };

  const handleResetDaily = () => {
    Alert.alert(
      'Reset Daily Counter',
      'This will reset today\'s prompt count to 0 and clear the cooldown timer.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDailySampling();
            setLastDecision('Daily counter reset.');
          },
        },
      ]
    );
  };

  const StatusRow = ({
    label,
    value,
    valueColor,
  }: {
    label: string;
    value: string;
    valueColor?: string;
  }) => (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Testing & Demo</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DEV</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Sampling State */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Sampling State</Text>

          <StatusRow
            label="Prompts Today"
            value={`${effectivePromptsToday} / ${APP_CONFIG.MAX_PROMPTS_PER_DAY}`}
            valueColor={effectivePromptsToday >= APP_CONFIG.MAX_PROMPTS_PER_DAY ? COLORS.error : COLORS.success}
          />
          <StatusRow
            label="Prompts Remaining"
            value={`${Math.max(promptsRemaining, 0)}`}
          />
          <StatusRow
            label="Last Prompt"
            value={getMinsSinceLastPrompt()}
          />
          <StatusRow
            label="Next Prompt Allowed"
            value={getTimeUntilNextAllowed()}
          />
          <StatusRow
            label="Active Window"
            value={`${user?.settings.windowStart ?? '??'} – ${user?.settings.windowEnd ?? '??'}`}
          />
          <StatusRow
            label="Currently In Window"
            value={isInActiveWindow() ? 'YES' : 'NO'}
            valueColor={isInActiveWindow() ? COLORS.success : COLORS.error}
          />
          <StatusRow
            label="Can Show Prompt Now"
            value={canShowPrompt() ? 'YES' : `NO — ${getSamplingBlockReason()}`}
            valueColor={canShowPrompt() ? COLORS.success : COLORS.error}
          />
          <StatusRow
            label="Active Sessions"
            value={`${sampling.activeSessions.length}`}
          />
          <StatusRow
            label="Study Group"
            value={user?.group === 'treatment' ? 'Treatment (MRP)' : 'Control (NP)'}
            valueColor={user?.group === 'treatment' ? COLORS.primary : COLORS.secondary}
          />

          <Button
            title="Reset Daily Counter"
            mode="outlined"
            onPress={handleResetDaily}
            style={styles.resetBtn}
          />
        </Card>

        {/* Last Decision */}
        {lastDecision && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Last Decision</Text>
            <Text style={styles.decisionText}>{lastDecision}</Text>
          </Card>
        )}

        {/* Simulate App Opens */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Simulate App Open → Prompt</Text>
          <Text style={styles.sectionHint}>
            Tapping a button fires the same logic as opening that app via iOS Shortcuts.
            A prompt will appear if sampling rules allow it; otherwise you'll see why it was skipped.
          </Text>

          <View style={styles.appGrid}>
            {SOCIAL_MEDIA_APPS.filter((a) =>
              user?.settings.trackedApps.includes(a.id)
            ).map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.appBtn}
                onPress={() => simulateAppOpen(app.id)}
              >
                <MaterialCommunityIcons
                  name={app.icon as any}
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.appBtnLabel}>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Simulate App Close → Satisfaction */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Simulate App Close → Satisfaction Survey</Text>
          <Text style={styles.sectionHint}>
            Only shows if there's an active session where a prompt was shown.
          </Text>

          <View style={styles.appGrid}>
            {SOCIAL_MEDIA_APPS.filter((a) =>
              user?.settings.trackedApps.includes(a.id)
            ).map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[
                  styles.appBtn,
                  !getActiveSession(app.id) && styles.appBtnDisabled,
                ]}
                onPress={() => simulateSatisfactionSurvey(app.id)}
              >
                <MaterialCommunityIcons
                  name={app.icon as any}
                  size={28}
                  color={getActiveSession(app.id) ? COLORS.secondary : COLORS.border}
                />
                <Text
                  style={[
                    styles.appBtnLabel,
                    !getActiveSession(app.id) && styles.appBtnLabelDisabled,
                  ]}
                >
                  {app.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Scheduled Surveys */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Trigger Scheduled Surveys</Text>
          <Text style={styles.sectionHint}>
            Simulates the 5 PM and 9 PM daily EMA surveys arriving via push notification.
          </Text>

          <View style={styles.surveyBtnRow}>
            <Button
              title="5 PM Survey"
              mode="outlined"
              onPress={() => triggerScheduledSurvey('5pm')}
              style={styles.surveyBtn}
            />
            <Button
              title="9 PM Survey"
              mode="outlined"
              onPress={() => triggerScheduledSurvey('9pm')}
              style={styles.surveyBtn}
            />
          </View>
        </Card>

        {/* Sampling Rules Summary */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Sampling Rules</Text>
          <Text style={styles.ruleText}>
            • Max <Text style={styles.bold}>{APP_CONFIG.MAX_PROMPTS_PER_DAY} prompts/day</Text> (sent, not necessarily answered)
          </Text>
          <Text style={styles.ruleText}>
            • At least <Text style={styles.bold}>{APP_CONFIG.MIN_HOURS_BETWEEN_PROMPTS} hour</Text> between consecutive prompts
          </Text>
          <Text style={styles.ruleText}>
            • Only during active window (default{' '}
            <Text style={styles.bold}>
              {APP_CONFIG.DEFAULT_WINDOW_START}–{APP_CONFIG.DEFAULT_WINDOW_END}
            </Text>)
          </Text>
          <Text style={styles.ruleText}>
            • Daily counter resets automatically at midnight
          </Text>
          <Text style={styles.ruleText}>
            • Satisfaction survey only shown if a prompt was displayed that session
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.warning,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 17,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '55',
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  resetBtn: {
    marginTop: 14,
  },
  decisionText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  appBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 76,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appBtnDisabled: {
    opacity: 0.4,
  },
  appBtnLabel: {
    fontSize: 10,
    color: COLORS.text,
    marginTop: 4,
    textAlign: 'center',
  },
  appBtnLabelDisabled: {
    color: COLORS.textSecondary,
  },
  surveyBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  surveyBtn: {
    flex: 1,
  },
  ruleText: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 19,
  },
  bold: {
    fontWeight: '700',
  },
});
