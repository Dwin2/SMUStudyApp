import React from 'react';
import { NavigationContainer, LinkingOptions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

// Exported so App.tsx can navigate from notification tap handlers
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

import {
  WelcomeScreen,
  PermissionsScreen,
  AppSelectionScreen,
  TimeWindowScreen,
  BaselineSurveyScreen,
  TutorialScreen,
  HomeScreen,
  SettingsScreen,
  PromptScreen,
  SatisfactionScreen,
  ScheduledSurveyScreen,
  TestingScreen,
} from '../screens';
import { useStore } from '../store/useStore';
import { COLORS } from '../constants';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Main tabs for the app after onboarding
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Deep linking configuration
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'smustudy://'],
  config: {
    screens: {
      Prompt: {
        path: 'open',
        parse: {
          platform: (platform: string) => platform,
          sessionId: (sessionId: string) => sessionId || `session-${Date.now()}`,
        },
      },
      Satisfaction: {
        path: 'close',
        parse: {
          platform: (platform: string) => platform,
          sessionId: (sessionId: string) => sessionId,
        },
      },
      ScheduledSurvey: {
        path: 'survey',
        parse: {
          surveyTime: (time: string) => (time === '9pm' ? '9pm' : '5pm'),
        },
      },
      MainTabs: 'home',
    },
  },
};

export const AppNavigator: React.FC = () => {
  const { user, isLoading } = useStore();

  // Determine initial route based on user state
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!user) return 'Welcome';

    switch (user.studyPhase) {
      case 'onboarding':
        return 'Welcome';
      case 'baseline':
        return 'BaselineSurvey';
      case 'intervention':
      case 'endline':
      case 'followup':
      case 'completed':
        return 'MainTabs';
      default:
        return 'Welcome';
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Onboarding Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
        <Stack.Screen name="AppSelection" component={AppSelectionScreen} />
        <Stack.Screen name="TimeWindow" component={TimeWindowScreen} />
        <Stack.Screen name="BaselineSurvey" component={BaselineSurveyScreen} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />

        {/* Main App */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Prompt Screens (Modal style) */}
        <Stack.Screen
          name="Prompt"
          component={PromptScreen}
          options={{
            presentation: 'containedModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Satisfaction"
          component={SatisfactionScreen}
          options={{
            presentation: 'containedModal',
            animation: 'fade',
          }}
        />

        {/* Survey Screens */}
        <Stack.Screen
          name="ScheduledSurvey"
          component={ScheduledSurveyScreen}
          options={{
            presentation: 'card',
          }}
        />

        {/* Developer Testing Screen */}
        <Stack.Screen
          name="Testing"
          component={TestingScreen}
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
