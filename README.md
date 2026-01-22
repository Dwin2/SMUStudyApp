# SMU Study App

A React Native mobile application for Harvard research studying social media motivation awareness.

## Overview

This app is designed for a 7-day randomized controlled experiment with ~250 participants. It detects when users open social media apps and shows intervention prompts (Motivation Reflection Prompt for treatment group, Neutral Prompt for control group).

## Features

- **App Usage Detection**: Monitors when users open tracked social media apps
  - Android: Background service using UsageStatsManager (requires custom dev client)
  - iOS: Shortcuts automation integration (similar to OneSec app)
- **Intervention Prompts**: Shows brief reflection prompts when opening social media
- **Satisfaction Surveys**: Collects satisfaction data when closing social media sessions
- **Scheduled Surveys**: Daily surveys at 5pm and 9pm for SMU experience and well-being
- **Study Timeline**: Day 0 (Baseline) → Days 1-7 (Intervention) → Day 8 (Endline) → Day 30 (Follow-up)

## Tech Stack

- React Native (Expo)
- TypeScript
- Firebase (Authentication, Firestore)
- React Navigation
- Zustand (State Management)
- React Native Paper (UI)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd SMUStudyApp
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Anonymous Authentication
   - Create a Firestore database
   - Copy your Firebase config to `src/services/firebase.ts`

4. Start the development server:
   ```bash
   npx expo start
   ```

### Firebase Configuration

Replace the placeholder values in `src/services/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

## Building for Production

### Android

```bash
npx expo build:android
# or with EAS
eas build --platform android
```

### iOS

```bash
npx expo build:ios
# or with EAS
eas build --platform ios
```

## Deep Linking

The app supports deep linking for iOS Shortcuts integration:

- `smustudy://open?app=instagram` - Opens the prompt for Instagram
- `smustudy://close?app=instagram&sessionId=xxx` - Opens the satisfaction survey

## Project Structure

```
SMUStudyApp/
├── src/
│   ├── components/
│   │   ├── common/        # Reusable UI components
│   │   ├── prompts/       # MRP, NP, Satisfaction prompts
│   │   └── surveys/       # Survey question components
│   ├── screens/           # App screens
│   ├── services/          # Firebase, notifications, app usage
│   ├── store/             # Zustand state store
│   ├── navigation/        # React Navigation setup
│   ├── types/             # TypeScript types
│   ├── constants/         # App configuration, survey questions
│   └── utils/             # Helper functions
├── App.tsx
├── app.json
└── package.json
```

## Data Collection

### Firestore Structure

```
users/{userId}
  - participantId: string
  - group: "treatment" | "control"
  - settings: { windowStart, windowEnd, trackedApps[] }
  - studyPhase: string

users/{userId}/responses/{responseId}
  - type: "mrp" | "np" | "satisfaction" | "scheduled_survey" | "baseline" | "endline"
  - data: object
  - timestamp: timestamp

users/{userId}/appEvents/{eventId}
  - type: "open" | "close"
  - platform: string
  - timestamp: timestamp
```

## Configuration

### Sampling Rules (in `src/constants/index.ts`)

- `MAX_PROMPTS_PER_DAY`: 15
- `MIN_HOURS_BETWEEN_PROMPTS`: 1
- `DEFAULT_WINDOW_START`: "08:00"
- `DEFAULT_WINDOW_END`: "23:00"
- `STUDY_DURATION_DAYS`: 7

## Contact

- yuning_liu@g.harvard.edu
- darwinli@college.harvard.edu
