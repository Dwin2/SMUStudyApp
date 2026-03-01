// User and Study Types

export type StudyGroup = 'treatment' | 'control';

export type StudyPhase = 'onboarding' | 'baseline' | 'intervention' | 'endline' | 'followup' | 'completed';

export interface UserSettings {
  windowStart: string; // "08:00"
  windowEnd: string; // "23:00"
  trackedApps: string[];
  name?: string;
}

export interface User {
  id: string;
  participantId: string;
  group: StudyGroup;
  createdAt: Date;
  settings: UserSettings;
  studyPhase: StudyPhase;
  studyStartDate: Date | null;
  baselineCompletedAt: Date | null;
  endlineCompletedAt: Date | null;
}

// Survey Response Types

export type ResponseType =
  | 'mrp'
  | 'np'
  | 'satisfaction'
  | 'scheduled_survey'
  | 'baseline'
  | 'endline'
  | 'followup';

export interface SurveyResponse {
  id: string;
  userId: string;
  type: ResponseType;
  platform?: string;
  data: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
}

// App Event Types

export type AppEventType = 'open' | 'close';

export interface AppEvent {
  id: string;
  userId: string;
  type: AppEventType;
  platform: string;
  timestamp: Date;
  sessionId: string;
  promptTriggered: boolean;
}

// Session Types

export interface AppSession {
  id: string;
  platform: string;
  openTime: Date;
  closeTime?: Date;
  promptShown: boolean;
  satisfactionCollected: boolean;
}

// Survey Question Types

export type SatisfactionLevel = 'not_satisfied' | 'neutral' | 'satisfied';

export interface LikertResponse {
  question: string;
  value: number; // 1-5
}

export interface SliderResponse {
  emotion: string;
  value: number; // 0-100
}

export interface ScheduledSurveyData {
  smuExperience: LikertResponse[];
  wellbeing: SliderResponse[];
}

export interface BaselineSurveyData {
  demographics: Record<string, any>;
  smuMindset: Record<string, any>;
  socialNetwork: Record<string, any>;
  depression: Record<string, any>;
  anxiety: Record<string, any>;
  smuHabit: Record<string, any>;
  needForCognition: Record<string, any>;
  problematicSMU: Record<string, any>;
  platformFrequency: Record<string, number>;
  smuExperience: LikertResponse[];
  wellbeing: SliderResponse[];
}

// Navigation Types

export type RootStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Permissions: undefined;
  AppSelection: undefined;
  TimeWindow: undefined;
  BaselineSurvey: undefined;
  Tutorial: undefined;
  MainTabs: undefined;
  Home: undefined;
  Settings: undefined;
  History: undefined;
  Prompt: { platform: string; sessionId: string };
  Satisfaction: { platform: string; sessionId: string };
  ScheduledSurvey: { surveyTime: '5pm' | '9pm' };
  EndlineSurvey: undefined;
  FollowupSurvey: undefined;
  Testing: undefined;
};

// Social Media Platform Types

export interface SocialMediaApp {
  id: string;
  name: string;
  packageName: string; // Android
  urlScheme: string; // iOS
  icon: string;
}

// Sampling State

export interface SamplingState {
  promptsToday: number;
  lastPromptTime: Date | null;
  lastResetDate: string | null; // ISO date string "YYYY-MM-DD" for daily reset tracking
  activeSessions: AppSession[];
}
