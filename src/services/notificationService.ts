import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { APP_CONFIG } from '../constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/**
 * Schedule daily surveys at 5pm and 9pm
 */
export const scheduleScheduledSurveys = async (): Promise<void> => {
  // Cancel existing scheduled notifications
  await cancelAllScheduledNotifications();

  // Schedule 5pm survey
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Afternoon Check-in',
      body: 'Time for your afternoon survey about your social media use today.',
      data: { type: 'scheduled_survey', surveyTime: '5pm' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 17,
      minute: 0,
    },
  });

  // Schedule 9pm survey
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Evening Check-in',
      body: 'Time for your evening survey about your social media use.',
      data: { type: 'scheduled_survey', surveyTime: '9pm' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });

  console.log('Scheduled daily surveys at 5pm and 9pm');
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Send an immediate notification (for testing or alerts)
 */
export const sendImmediateNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Immediate
  });
};

/**
 * Show a notification when an app close survey is pending
 */
export const showSatisfactionSurveyNotification = async (
  platform: string,
  sessionId: string
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Quick Question',
      body: `How satisfied were you with your ${platform} session?`,
      data: { type: 'satisfaction', platform, sessionId },
      sound: true,
    },
    trigger: null, // Immediate
  });
};

/**
 * Set up notification listeners
 */
export const setupNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
): (() => void) => {
  // Listener for when a notification is received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  );

  // Listener for when user interacts with a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    onNotificationResponse
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Get the notification that was used to open the app
 */
export const getLastNotificationResponse =
  async (): Promise<Notifications.NotificationResponse | null> => {
    return Notifications.getLastNotificationResponseAsync();
  };

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  return Notifications.getAllScheduledNotificationsAsync();
};

/**
 * Schedule a reminder for endline survey
 */
export const scheduleEndlineSurveyReminder = async (
  studyStartDate: Date
): Promise<void> => {
  const endlineDate = new Date(studyStartDate);
  endlineDate.setDate(endlineDate.getDate() + APP_CONFIG.STUDY_DURATION_DAYS);
  endlineDate.setHours(10, 0, 0, 0);

  // Only schedule if the date is in the future
  if (endlineDate > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Study Complete!',
        body: 'Your 7-day study period is complete. Please complete the final survey.',
        data: { type: 'endline_survey' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: endlineDate,
      },
    });
  }
};

/**
 * Schedule follow-up survey reminder for Day 30
 */
export const scheduleFollowupSurveyReminder = async (
  studyStartDate: Date
): Promise<void> => {
  const followupDate = new Date(studyStartDate);
  followupDate.setDate(followupDate.getDate() + APP_CONFIG.FOLLOWUP_DAY);
  followupDate.setHours(10, 0, 0, 0);

  // Only schedule if the date is in the future
  if (followupDate > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Follow-up Survey',
        body: 'It\'s time for your 30-day follow-up survey. We appreciate your continued participation!',
        data: { type: 'followup_survey' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: followupDate,
      },
    });
  }
};

/**
 * Clear app badge count
 */
export const clearBadgeCount = async (): Promise<void> => {
  await Notifications.setBadgeCountAsync(0);
};
