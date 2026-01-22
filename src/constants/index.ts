import { SocialMediaApp } from '../types';

// App Configuration
export const APP_CONFIG = {
  MAX_PROMPTS_PER_DAY: 15,
  MIN_HOURS_BETWEEN_PROMPTS: 1,
  DEFAULT_WINDOW_START: '08:00',
  DEFAULT_WINDOW_END: '23:00',
  STUDY_DURATION_DAYS: 7,
  FOLLOWUP_DAY: 30,
  SCHEDULED_SURVEY_TIMES: ['17:00', '21:00'] as const,
};

// Tracked Social Media Apps
export const SOCIAL_MEDIA_APPS: SocialMediaApp[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    urlScheme: 'fb://',
    icon: 'facebook',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    urlScheme: 'instagram://',
    icon: 'instagram',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    urlScheme: 'youtube://',
    icon: 'youtube',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    urlScheme: 'snssdk1128://',
    icon: 'music-note',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    packageName: 'com.snapchat.android',
    urlScheme: 'snapchat://',
    icon: 'snapchat',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    urlScheme: 'twitter://',
    icon: 'twitter',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    urlScheme: 'whatsapp://',
    icon: 'whatsapp',
  },
  {
    id: 'discord',
    name: 'Discord',
    packageName: 'com.discord',
    urlScheme: 'discord://',
    icon: 'discord',
  },
];

// Neutral Prompt Questions (rotating)
export const NEUTRAL_PROMPT_QUESTIONS = [
  'What is one object you can see in front of you right now?',
  'What is one object you can see near you right now?',
  'Where are you sitting or standing right now?',
  'What colors are most noticeable around you right now?',
  'What object do your eyes naturally fall on right now?',
];

// Motivation Reflection Prompt
export const MOTIVATION_PROMPT = {
  intro: 'People use social media for different reasons at different moments.',
  question: 'Right now, what are you hoping to do by using [platform]?',
  note: 'This is not about changing or limiting your use. It is just a brief moment of reflection.',
};

// Satisfaction Survey Options
export const SATISFACTION_OPTIONS = [
  { value: 'not_satisfied', label: 'Not satisfied', icon: 'emoticon-sad-outline' },
  { value: 'neutral', label: 'Neutral', icon: 'emoticon-neutral-outline' },
  { value: 'satisfied', label: 'Satisfied', icon: 'emoticon-happy-outline' },
];

// SMU Experience Questions (Likert 1-5)
export const SMU_EXPERIENCE_QUESTIONS = [
  {
    id: 'happy',
    text: 'My social media use felt happy',
    labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  },
  {
    id: 'meaningful',
    text: 'My social media use felt meaningful',
    labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  },
  {
    id: 'effortful',
    text: 'My social media use felt effortful',
    labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  },
];

// Well-being Emotions (Slider 0-100)
export const WELLBEING_EMOTIONS = [
  { id: 'happy', label: 'Happy', positive: true },
  { id: 'inspired', label: 'Inspired', positive: true },
  { id: 'life_satisfaction', label: 'Life satisfaction', positive: true },
  { id: 'sad', label: 'Sad', positive: false },
  { id: 'angry', label: 'Angry', positive: false },
  { id: 'lonely', label: 'Lonely', positive: false },
];

// Baseline Survey Sections
export const BASELINE_SECTIONS = {
  demographics: {
    title: 'Demographics',
    questions: [
      { id: 'age', type: 'number', label: 'What is your age?' },
      {
        id: 'gender',
        type: 'select',
        label: 'What is your gender?',
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
      },
      {
        id: 'education',
        type: 'select',
        label: 'What is your highest level of education?',
        options: [
          'High school or less',
          'Some college',
          "Bachelor's degree",
          "Master's degree",
          'Doctoral degree',
          'Other',
        ],
      },
    ],
  },
  platformFrequency: {
    title: 'Platform Usage',
    instruction: 'How often do you use each of these platforms?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
  },
};

// Colors
export const COLORS = {
  primary: '#6200EE',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  error: '#B00020',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  cardBackground: '#F5F5F5',
};
