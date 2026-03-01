import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Button, Card, LikertScale, EmotionSlider, ProgressBar, TextInput } from '../components/common';
import { COLORS, SMU_EXPERIENCE_QUESTIONS, WELLBEING_EMOTIONS, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type BaselineSurveyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BaselineSurvey'>;
};

const TOTAL_SECTIONS = 4;

export const BaselineSurveyScreen: React.FC<BaselineSurveyScreenProps> = ({ navigation }) => {
  const { saveBaselineSurvey } = useStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Survey data
  const [demographics, setDemographics] = useState({
    age: '',
    gender: '',
    education: '',
  });

  const [platformFrequency, setPlatformFrequency] = useState<Record<string, number>>(
    SOCIAL_MEDIA_APPS.reduce((acc, app) => ({ ...acc, [app.id]: 0 }), {})
  );

  const [smuExperience, setSmuExperience] = useState<Record<string, number | null>>(
    SMU_EXPERIENCE_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
  );

  const [wellbeing, setWellbeing] = useState<Record<string, number>>(
    WELLBEING_EMOTIONS.reduce((acc, e) => ({ ...acc, [e.id]: 50 }), {})
  );

  const handleNext = () => {
    if (currentSection < TOTAL_SECTIONS - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveBaselineSurvey({
        demographics,
        platformFrequency,
        smuExperience,
        wellbeing,
        completedAt: new Date().toISOString(),
      });
      navigation.navigate('Tutorial');
    } catch (error) {
      console.error('Error saving baseline survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentSection) {
      case 0:
        return demographics.age && demographics.gender && demographics.education;
      case 1:
        return true; // Platform frequency is optional
      case 2:
        return Object.values(smuExperience).every((v) => v !== null);
      case 3:
        return true; // Wellbeing has default values
      default:
        return true;
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return renderDemographics();
      case 1:
        return renderPlatformFrequency();
      case 2:
        return renderSMUExperience();
      case 3:
        return renderWellbeing();
      default:
        return null;
    }
  };

  const GENDER_OPTIONS = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non-binary' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
    { label: 'Other', value: 'other' },
  ];

  const EDUCATION_OPTIONS = [
    { label: 'High school or less', value: 'high_school' },
    { label: 'Some college', value: 'some_college' },
    { label: "Bachelor's degree", value: 'bachelors' },
    { label: "Master's degree", value: 'masters' },
    { label: 'Doctoral degree', value: 'doctoral' },
    { label: 'Other', value: 'other' },
  ];

  const renderOptionPills = (
    options: { label: string; value: string }[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.pillGroup}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderDemographics = () => (
    <View>
      <Text style={styles.sectionTitle}>About You</Text>
      <Text style={styles.sectionDescription}>
        Let's start with some basic information about yourself.
      </Text>

      <Card>
        <Text style={styles.questionLabel}>What is your age?</Text>
        <TextInput
          value={demographics.age}
          onChangeText={(text) => setDemographics({ ...demographics, age: text })}
          placeholder="Enter your age"
          keyboardType="numeric"
        />

        <Text style={styles.questionLabel}>What is your gender?</Text>
        {renderOptionPills(
          GENDER_OPTIONS,
          demographics.gender,
          (value) => setDemographics({ ...demographics, gender: value })
        )}

        <Text style={styles.questionLabel}>What is your highest level of education?</Text>
        {renderOptionPills(
          EDUCATION_OPTIONS,
          demographics.education,
          (value) => setDemographics({ ...demographics, education: value })
        )}
      </Card>
    </View>
  );

  const renderPlatformFrequency = () => (
    <View>
      <Text style={styles.sectionTitle}>Platform Usage</Text>
      <Text style={styles.sectionDescription}>
        How often do you use each of these platforms? (0 = Never, 4 = Very often)
      </Text>

      {SOCIAL_MEDIA_APPS.map((app) => (
        <Card key={app.id} style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <Text style={styles.platformName}>{app.name}</Text>
            <Text style={styles.frequencyValue}>{platformFrequency[app.id]}</Text>
          </View>
          <View style={styles.frequencyButtons}>
            {[0, 1, 2, 3, 4].map((value) => (
              <Button
                key={value}
                title={value.toString()}
                mode={platformFrequency[app.id] === value ? 'contained' : 'outlined'}
                onPress={() => setPlatformFrequency({ ...platformFrequency, [app.id]: value })}
                style={styles.frequencyButton}
              />
            ))}
          </View>
        </Card>
      ))}
    </View>
  );

  const renderSMUExperience = () => (
    <View>
      <Text style={styles.sectionTitle}>Social Media Experience</Text>
      <Text style={styles.sectionDescription}>
        Thinking about your social media use recently, please rate the following statements.
      </Text>

      <Card>
        {SMU_EXPERIENCE_QUESTIONS.map((question) => (
          <LikertScale
            key={question.id}
            question={question.text}
            value={smuExperience[question.id]}
            onChange={(value) => setSmuExperience({ ...smuExperience, [question.id]: value })}
            labels={question.labels}
          />
        ))}
      </Card>
    </View>
  );

  const renderWellbeing = () => (
    <View>
      <Text style={styles.sectionTitle}>Well-being</Text>
      <Text style={styles.sectionDescription}>
        On a scale from 0 to 100, how strongly are you feeling the following emotions right now?
      </Text>

      <Card>
        {WELLBEING_EMOTIONS.map((emotion) => (
          <EmotionSlider
            key={emotion.id}
            emotion={emotion.label}
            value={wellbeing[emotion.id]}
            onChange={(value) => setWellbeing({ ...wellbeing, [emotion.id]: value })}
            positive={emotion.positive}
          />
        ))}
      </Card>
    </View>
  );

  const sectionTitles = ['Demographics', 'Platform Usage', 'SMU Experience', 'Well-being'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Baseline Survey</Text>
          <ProgressBar
            progress={(currentSection + 1) / TOTAL_SECTIONS}
            label={sectionTitles[currentSection]}
          />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderSection()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentSection > 0 && (
              <Button title="Back" onPress={handleBack} mode="outlined" style={styles.backButton} />
            )}
            <Button
              title={currentSection === TOTAL_SECTIONS - 1 ? 'Submit' : 'Next'}
              onPress={handleNext}
              disabled={!canProceed()}
              loading={isSubmitting}
              style={styles.nextButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 19,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 8,
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.text,
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  platformCard: {
    marginBottom: 12,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  frequencyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  frequencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 2,
  },
});
