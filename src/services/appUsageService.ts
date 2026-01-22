import { Platform, Linking, NativeModules } from 'react-native';
import { SOCIAL_MEDIA_APPS } from '../constants';
import { useStore } from '../store/useStore';

/**
 * App Usage Detection Service
 *
 * This service handles detecting when users open/close tracked social media apps.
 *
 * Android: Uses UsageStatsManager via native module (requires custom dev client)
 * iOS: Uses deep linking from Shortcuts automations
 */

// Package names for Android app detection
export const ANDROID_PACKAGE_NAMES = SOCIAL_MEDIA_APPS.reduce((acc, app) => {
  acc[app.packageName] = app.id;
  return acc;
}, {} as Record<string, string>);

// URL schemes for iOS detection
export const IOS_URL_SCHEMES = SOCIAL_MEDIA_APPS.reduce((acc, app) => {
  acc[app.urlScheme] = app.id;
  return acc;
}, {} as Record<string, string>);

/**
 * Handle incoming deep link for iOS Shortcuts integration
 * Deep link format: smustudy://open?app=instagram
 */
export const handleDeepLink = (url: string): { platform: string; sessionId: string } | null => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === 'smustudy:') {
      const path = parsedUrl.hostname; // 'open' or 'close'
      const app = parsedUrl.searchParams.get('app');
      const sessionId = parsedUrl.searchParams.get('sessionId') || `session-${Date.now()}`;

      if (app) {
        // Normalize app name to our app ID
        const normalizedApp = app.toLowerCase().replace(/[^a-z]/g, '');
        const matchedApp = SOCIAL_MEDIA_APPS.find(
          (a) => a.id === normalizedApp || a.name.toLowerCase().replace(/[^a-z]/g, '') === normalizedApp
        );

        if (matchedApp) {
          return {
            platform: matchedApp.id,
            sessionId,
          };
        }
      }
    }
  } catch (error) {
    console.error('Error parsing deep link:', error);
  }

  return null;
};

/**
 * Set up deep link listener for iOS Shortcuts integration
 */
export const setupDeepLinkListener = (
  onAppOpen: (platform: string, sessionId: string) => void
): (() => void) => {
  // Handle initial URL (app opened via deep link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      const result = handleDeepLink(url);
      if (result) {
        onAppOpen(result.platform, result.sessionId);
      }
    }
  });

  // Handle deep links while app is running
  const subscription = Linking.addEventListener('url', (event) => {
    const result = handleDeepLink(event.url);
    if (result) {
      onAppOpen(result.platform, result.sessionId);
    }
  });

  return () => {
    subscription.remove();
  };
};

/**
 * Open a social media app via URL scheme
 */
export const openSocialMediaApp = async (appId: string): Promise<boolean> => {
  const app = SOCIAL_MEDIA_APPS.find((a) => a.id === appId);
  if (!app) return false;

  const canOpen = await Linking.canOpenURL(app.urlScheme);
  if (canOpen) {
    await Linking.openURL(app.urlScheme);
    return true;
  }

  return false;
};

/**
 * Check if a social media app is installed
 */
export const isAppInstalled = async (appId: string): Promise<boolean> => {
  const app = SOCIAL_MEDIA_APPS.find((a) => a.id === appId);
  if (!app) return false;

  try {
    return await Linking.canOpenURL(app.urlScheme);
  } catch {
    return false;
  }
};

/**
 * Get list of installed tracked apps
 */
export const getInstalledTrackedApps = async (): Promise<string[]> => {
  const installedApps: string[] = [];

  for (const app of SOCIAL_MEDIA_APPS) {
    const installed = await isAppInstalled(app.id);
    if (installed) {
      installedApps.push(app.id);
    }
  }

  return installedApps;
};

/**
 * Instructions for iOS Shortcuts setup
 * Returns step-by-step instructions for users to set up automations
 */
export const getIOSShortcutsInstructions = (appName: string): string[] => {
  return [
    `1. Open the Shortcuts app on your iPhone`,
    `2. Tap the "Automation" tab at the bottom`,
    `3. Tap the "+" button to create a new automation`,
    `4. Select "App" under "Personal Automation"`,
    `5. Select "${appName}" from the app list`,
    `6. Make sure "Is Opened" is selected`,
    `7. Tap "Next"`,
    `8. Tap "Add Action"`,
    `9. Search for "Open App" and select it`,
    `10. Tap "App" and select "SMU Study"`,
    `11. Tap "Next"`,
    `12. Turn OFF "Ask Before Running"`,
    `13. Tap "Done"`,
    ``,
    `Repeat these steps for each social media app you want to track.`,
  ];
};

/**
 * Generate Shortcuts automation URL (for one-tap setup)
 * Note: This requires the Shortcuts URL scheme which may have limitations
 */
export const getShortcutsURL = (appId: string): string => {
  const app = SOCIAL_MEDIA_APPS.find((a) => a.id === appId);
  if (!app) return '';

  // This is a placeholder - actual implementation would require
  // creating a .shortcut file or using the Shortcuts URL scheme
  return `shortcuts://`;
};

// Android-specific functions (would require native module)
// These are placeholders that would be implemented in a custom dev client

/**
 * Start the Android app usage monitoring service
 * Note: Requires custom native module and PACKAGE_USAGE_STATS permission
 */
export const startAndroidMonitoring = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  // This would call a native module in a custom dev client
  // For now, we return false to indicate it's not implemented
  console.log('Android monitoring requires custom native module');
  return false;
};

/**
 * Stop the Android app usage monitoring service
 */
export const stopAndroidMonitoring = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  // This would call a native module in a custom dev client
  return false;
};

/**
 * Check if the app has usage stats permission on Android
 */
export const hasUsageStatsPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true; // iOS doesn't need this

  // This would check the native permission
  // For now, we return false to indicate it's not implemented
  return false;
};

/**
 * Open Android usage access settings
 */
export const openUsageAccessSettings = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  try {
    await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
  } catch (error) {
    console.error('Error opening usage access settings:', error);
  }
};
