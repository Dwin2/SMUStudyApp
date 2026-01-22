import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Card } from '../components/common';
import { COLORS, APP_CONFIG } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimeWindowScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TimeWindow'>;
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

export const TimeWindowScreen: React.FC<TimeWindowScreenProps> = ({ navigation }) => {
  const { user, updateSettings } = useStore();
  const [windowStart, setWindowStart] = useState(
    user?.settings.windowStart || APP_CONFIG.DEFAULT_WINDOW_START
  );
  const [windowEnd, setWindowEnd] = useState(
    user?.settings.windowEnd || APP_CONFIG.DEFAULT_WINDOW_END
  );

  const handleContinue = async () => {
    await updateSettings({ windowStart, windowEnd });
    navigation.navigate('BaselineSurvey');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Set Your Active Hours</Text>
        <Text style={styles.subtitle}>
          We'll only send prompts during these hours. This should match your typical
          waking hours when you use social media.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Start Time</Text>
          <Text style={styles.cardDescription}>
            When should we start monitoring each day?
          </Text>
          <View style={styles.optionsRow}>
            {TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeOption,
                  windowStart === option.value && styles.timeOptionSelected,
                ]}
                onPress={() => setWindowStart(option.value)}
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
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>End Time</Text>
          <Text style={styles.cardDescription}>
            When should we stop monitoring each day?
          </Text>
          <View style={styles.optionsRow}>
            {END_TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeOption,
                  windowEnd === option.value && styles.timeOptionSelected,
                ]}
                onPress={() => setWindowEnd(option.value)}
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

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            You'll receive up to {APP_CONFIG.MAX_PROMPTS_PER_DAY} prompts per day, with at least{' '}
            {APP_CONFIG.MIN_HOURS_BETWEEN_PROMPTS} hour between each prompt.
          </Text>
        </View>

        <Button title="Continue" onPress={handleContinue} style={styles.button} />
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
    paddingBottom: 40,
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
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  timeOptionTextSelected: {
    color: COLORS.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
});
