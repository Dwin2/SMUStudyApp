import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Card, LikertScale, EmotionSlider, ProgressBar, TextInput } from '../components/common';
import { COLORS, SMU_EXPERIENCE_QUESTIONS, WELLBEING_EMOTIONS, SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { Picker } from '@react-native-picker/picker';

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
        />

        <Text style={styles.questionLabel}>What is your gender?</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={demographics.gender}
            onValueChange={(value) => setDemographics({ ...demographics, gender: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Non-binary" value="non-binary" />
            <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <Text style={styles.questionLabel}>What is your highest level of education?</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={demographics.education}
            onValueChange={(value) => setDemographics({ ...demographics, education: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select education level" value="" />
            <Picker.Item label="High school or less" value="high_school" />
            <Picker.Item label="Some college" value="some_college" />
            <Picker.Item label="Bachelor's degree" value="bachelors" />
            <Picker.Item label="Master's degree" value="masters" />
            <Picker.Item label="Doctoral degree" value="doctoral" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
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
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
  },
  picker: {
    height: 50,
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
