import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

import { AppNavigator, navigationRef } from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { COLORS } from './src/constants';
import {
  setupNotificationListeners,
  scheduleScheduledSurveys,
} from './src/services/notificationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Custom theme for React Native Paper
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.error,
  },
};

// Loading screen component
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.logoContainer}>
      <Text style={styles.logo}>SMU</Text>
    </View>
    <Text style={styles.loadingTitle}>Social Media Study</Text>
    <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Navigate from a notification tap to the correct screen.
// Called both when the app is in the foreground and when it's cold-started
// from a notification tap.
function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as Record<string, any>;

  if (!navigationRef.isReady()) return;

  if (data?.type === 'scheduled_survey' && data?.surveyTime) {
    navigationRef.navigate('ScheduledSurvey', {
      surveyTime: data.surveyTime as '5pm' | '9pm',
    });
  } else if (data?.type === 'satisfaction' && data?.platform && data?.sessionId) {
    navigationRef.navigate('Satisfaction', {
      platform: data.platform as string,
      sessionId: data.sessionId as string,
    });
  }
}

export default function App() {
  const { initialize, isLoading, user } = useStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initialize();
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Schedule daily surveys whenever the user enters/is in the intervention phase.
  // Runs on every app open so notifications stay scheduled even if the OS clears them.
  useEffect(() => {
    if (user?.studyPhase === 'intervention') {
      scheduleScheduledSurveys().catch(console.warn);
    }
  }, [user?.studyPhase]);

  // Wire up notification tap handler.
  useEffect(() => {
    // Handle tap if the app was opened cold from a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleNotificationResponse(response);
    });

    // Handle taps while the app is running
    const cleanup = setupNotificationListeners(
      () => {}, // foreground notifications handled by system
      handleNotificationResponse
    );

    return cleanup;
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
