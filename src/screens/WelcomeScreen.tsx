import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Button } from '../components/common';
import { COLORS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { user } = useStore();

  const handleGetStarted = () => {
    navigation.navigate('Permissions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>SMU</Text>
          </View>
          <Text style={styles.title}>Social Media Study</Text>
          <Text style={styles.subtitle}>Harvard Research Project</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome to our research study!</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What is this study about?</Text>
            <Text style={styles.infoText}>
              We're researching how people use social media and how brief moments
              of reflection might affect your experience. Your participation helps
              us understand the relationship between intention and social media use.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What will you do?</Text>
            <Text style={styles.infoText}>
              {'\u2022'} Complete a brief baseline survey{'\n'}
              {'\u2022'} Receive occasional prompts when opening social media apps{'\n'}
              {'\u2022'} Answer short questions at 5pm and 9pm daily{'\n'}
              {'\u2022'} Participate for 7 days
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Your privacy</Text>
            <Text style={styles.infoText}>
              All data is anonymized and used only for research purposes.
              You can withdraw at any time.
            </Text>
          </View>

          {user && (
            <View style={styles.participantInfo}>
              <Text style={styles.participantLabel}>Your Participant ID:</Text>
              <Text style={styles.participantId}>{user.participantId}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            icon="arrow-right"
          />
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
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  participantInfo: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
  },
  participantLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  participantId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  footer: {
    marginTop: 24,
  },
});
