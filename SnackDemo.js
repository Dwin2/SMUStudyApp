// SMU Study App - Demo Version for Expo Snack
// Copy this entire code to https://snack.expo.dev

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';

const COLORS = {
  primary: '#6200EE',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  cardBackground: '#F5F5F5',
  success: '#4CAF50',
};

// Simple Button Component
const Button = ({ title, onPress, disabled, mode = 'contained' }) => (
  <TouchableOpacity
    style={[
      styles.button,
      mode === 'contained' ? styles.buttonContained : styles.buttonOutlined,
      disabled && styles.buttonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[
      styles.buttonText,
      mode === 'outlined' && styles.buttonTextOutlined
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Card Component
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ========== SCREENS ==========

// Welcome Screen
const WelcomeScreen = ({ onNext }) => (
  <ScrollView contentContainerStyle={styles.screenContent}>
    <View style={styles.logoContainer}>
      <Text style={styles.logo}>SMU</Text>
    </View>
    <Text style={styles.title}>Social Media Study</Text>
    <Text style={styles.subtitle}>Harvard Research Project</Text>

    <Card style={styles.infoCard}>
      <Text style={styles.cardTitle}>What is this study about?</Text>
      <Text style={styles.cardText}>
        We're researching how people use social media and how brief moments
        of reflection might affect your experience.
      </Text>
    </Card>

    <Card style={styles.infoCard}>
      <Text style={styles.cardTitle}>What will you do?</Text>
      <Text style={styles.cardText}>
        • Complete a brief baseline survey{'\n'}
        • Receive occasional prompts when opening social media{'\n'}
        • Answer short questions at 5pm and 9pm daily{'\n'}
        • Participate for 7 days
      </Text>
    </Card>

    <View style={styles.participantBox}>
      <Text style={styles.participantLabel}>Your Participant ID:</Text>
      <Text style={styles.participantId}>A1B2C3D4</Text>
    </View>

    <Button title="Get Started" onPress={onNext} />
  </ScrollView>
);

// App Selection Screen
const AppSelectionScreen = ({ onNext }) => {
  const [selected, setSelected] = useState(['instagram', 'tiktok', 'youtube']);
  const apps = [
    { id: 'facebook', name: 'Facebook' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'snapchat', name: 'Snapchat' },
    { id: 'twitter', name: 'X (Twitter)' },
  ];

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Text style={styles.title}>Select Apps to Track</Text>
      <Text style={styles.description}>
        Choose which social media apps you want us to monitor during the study.
      </Text>

      <View style={styles.appsGrid}>
        {apps.map(app => (
          <TouchableOpacity
            key={app.id}
            style={[styles.appCard, selected.includes(app.id) && styles.appCardSelected]}
            onPress={() => toggle(app.id)}
          >
            <View style={[styles.appIcon, selected.includes(app.id) && styles.appIconSelected]}>
              <Text style={styles.appIconText}>{app.name[0]}</Text>
            </View>
            <Text style={[styles.appName, selected.includes(app.id) && styles.appNameSelected]}>
              {app.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectionCount}>{selected.length} apps selected</Text>
      <Button title="Continue" onPress={onNext} disabled={selected.length === 0} />
    </ScrollView>
  );
};

// Time Window Screen
const TimeWindowScreen = ({ onNext }) => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('23:00');

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Text style={styles.title}>Set Your Active Hours</Text>
      <Text style={styles.description}>
        We'll only send prompts during these hours.
      </Text>

      <Card>
        <Text style={styles.cardTitle}>Start Time</Text>
        <View style={styles.timeOptions}>
          {['06:00', '07:00', '08:00', '09:00'].map(time => (
            <TouchableOpacity
              key={time}
              style={[styles.timeOption, startTime === time && styles.timeOptionSelected]}
              onPress={() => setStartTime(time)}
            >
              <Text style={[styles.timeOptionText, startTime === time && styles.timeOptionTextSelected]}>
                {time === '06:00' ? '6 AM' : time === '07:00' ? '7 AM' : time === '08:00' ? '8 AM' : '9 AM'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>End Time</Text>
        <View style={styles.timeOptions}>
          {['21:00', '22:00', '23:00', '00:00'].map(time => (
            <TouchableOpacity
              key={time}
              style={[styles.timeOption, endTime === time && styles.timeOptionSelected]}
              onPress={() => setEndTime(time)}
            >
              <Text style={[styles.timeOptionText, endTime === time && styles.timeOptionTextSelected]}>
                {time === '21:00' ? '9 PM' : time === '22:00' ? '10 PM' : time === '23:00' ? '11 PM' : '12 AM'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.infoBox}>
        <Text style={styles.infoText}>
          You'll receive up to 15 prompts per day, with at least 1 hour between each.
        </Text>
      </Card>

      <Button title="Continue" onPress={onNext} />
    </ScrollView>
  );
};

// Motivation Prompt Screen (Treatment Group)
const MotivationPromptScreen = ({ onNext }) => {
  const [response, setResponse] = useState('');

  return (
    <View style={styles.promptContainer}>
      <Card style={styles.promptCard}>
        <View style={styles.promptIconContainer}>
          <Text style={styles.promptIcon}>I</Text>
        </View>
        <Text style={styles.promptIntro}>
          People use social media for different reasons at different moments.
        </Text>
        <Text style={styles.promptQuestion}>
          Right now, what are you hoping to do by using Instagram?
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Share your thoughts..."
          value={response}
          onChangeText={setResponse}
          multiline
          numberOfLines={3}
        />
        <Text style={styles.promptNote}>
          This is not about changing or limiting your use. It is just a brief moment of reflection.
        </Text>
        <Button title="Continue" onPress={onNext} disabled={!response.trim()} />
      </Card>
    </View>
  );
};

// Satisfaction Screen
const SatisfactionScreen = ({ onNext }) => (
  <View style={styles.promptContainer}>
    <Card style={styles.promptCard}>
      <Text style={styles.promptQuestion}>
        How satisfied are you with your experience on Instagram just now?
      </Text>
      <View style={styles.satisfactionOptions}>
        {[
          { label: 'Not satisfied', emoji: '😞' },
          { label: 'Neutral', emoji: '😐' },
          { label: 'Satisfied', emoji: '😊' },
        ].map(option => (
          <TouchableOpacity key={option.label} style={styles.satisfactionOption} onPress={onNext}>
            <Text style={styles.satisfactionEmoji}>{option.emoji}</Text>
            <Text style={styles.satisfactionLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  </View>
);

// Home Screen
const HomeScreen = ({ onShowPrompt }) => (
  <ScrollView contentContainerStyle={styles.screenContent}>
    <View style={styles.homeHeader}>
      <Text style={styles.greeting}>Hello!</Text>
      <Text style={styles.participantBadge}>ID: A1B2C3D4</Text>
    </View>

    <Card>
      <Text style={styles.cardTitle}>📅 Study Progress</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '43%' }]} />
      </View>
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>Day 3 of 7</Text>
        <Text style={styles.groupBadge}>Treatment Group</Text>
      </View>
    </Card>

    <Card>
      <Text style={styles.cardTitle}>📊 Today's Activity</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Prompts Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>10</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
    </Card>

    <Card>
      <Text style={styles.cardTitle}>🔔 Next Survey</Text>
      <Text style={styles.surveyTime}>5:00 PM</Text>
      <Text style={styles.surveyNote}>You'll receive a notification when it's time.</Text>
    </Card>

    <Card>
      <Text style={styles.cardTitle}>📱 Tracked Apps</Text>
      <Text style={styles.appsList}>Instagram, TikTok, YouTube</Text>
    </Card>

    <Button title="Demo: Show Prompt" onPress={onShowPrompt} mode="outlined" />
  </ScrollView>
);

// Main App
export default function App() {
  const [screen, setScreen] = useState('welcome');

  const screens = {
    welcome: <WelcomeScreen onNext={() => setScreen('apps')} />,
    apps: <AppSelectionScreen onNext={() => setScreen('time')} />,
    time: <TimeWindowScreen onNext={() => setScreen('home')} />,
    home: <HomeScreen onShowPrompt={() => setScreen('prompt')} />,
    prompt: <MotivationPromptScreen onNext={() => setScreen('satisfaction')} />,
    satisfaction: <SatisfactionScreen onNext={() => setScreen('home')} />,
  };

  return (
    <SafeAreaView style={styles.container}>
      {screens[screen]}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  participantBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    marginBottom: 24,
  },
  participantLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  participantId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContained: {
    backgroundColor: COLORS.primary,
  },
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutlined: {
    color: COLORS.primary,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appCard: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appIconSelected: {
    backgroundColor: COLORS.primary,
  },
  appIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  appNameSelected: {
    color: COLORS.primary,
  },
  selectionCount: {
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  timeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  timeOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  timeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  promptContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  promptIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  promptIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  promptIntro: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  promptQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  promptNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  satisfactionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  satisfactionOption: {
    alignItems: 'center',
    padding: 16,
  },
  satisfactionEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  satisfactionLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  homeHeader: {
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
  participantBadge: {
    fontSize: 14,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  surveyTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 4,
  },
  surveyNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  appsList: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
