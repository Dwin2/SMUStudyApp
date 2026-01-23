import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Button, Card, LikertScale, EmotionSlider, ProgressBar } from '../components/common';
import { COLORS, SMU_EXPERIENCE_QUESTIONS, WELLBEING_EMOTIONS } from '../constants';
import { useStore } from '../store/useStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

type ScheduledSurveyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ScheduledSurvey'>;
  route: RouteProp<RootStackParamList, 'ScheduledSurvey'>;
};

const TOTAL_SECTIONS = 2;

export const ScheduledSurveyScreen: React.FC<ScheduledSurveyScreenProps> = ({
  navigation,
  route,
}) => {
  const { surveyTime } = route.params;
  const { saveScheduledSurvey } = useStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [smuExperience, setSmuExperience] = useState<Record<string, number | null>>(
    SMU_EXPERIENCE_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
  );

  const [wellbeing, setWellbeing] = useState<Record<string, number>>(
    WELLBEING_EMOTIONS.reduce((acc, e) => ({ ...acc, [e.id]: 50 }), {})
  );

  const timeLabel = surveyTime === '5pm' ? 'today' : 'this evening';

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
      await saveScheduledSurvey(surveyTime, {
        smuExperience,
        wellbeing,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving scheduled survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentSection) {
      case 0:
        return Object.values(smuExperience).every((v) => v !== null);
      case 1:
        return true;
      default:
        return true;
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return renderSMUExperience();
      case 1:
        return renderWellbeing();
      default:
        return null;
    }
  };

  const renderSMUExperience = () => (
    <View>
      <Text style={styles.sectionTitle}>Social Media Experience</Text>
      <Text style={styles.sectionDescription}>
        Thinking about your social media use {timeLabel}, please rate the following statements.
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
      <Text style={styles.sectionTitle}>How are you feeling?</Text>
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

  const sectionTitles = ['SMU Experience', 'Well-being'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {surveyTime === '5pm' ? 'Afternoon' : 'Evening'} Check-in
        </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
