import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Linking, Alert } from 'react-native';
import { Button, Card } from '../components/common';
import { COLORS } from '../constants';
import * as Notifications from 'expo-notifications';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PermissionsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Permissions'>;
};

interface PermissionStatus {
  notifications: boolean;
  usageStats: boolean;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ navigation }) => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    notifications: false,
    usageStats: false,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check notification permissions
    const { status } = await Notifications.getPermissionsAsync();
    setPermissions((prev) => ({
      ...prev,
      notifications: status === 'granted',
    }));
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissions((prev) => ({
      ...prev,
      notifications: status === 'granted',
    }));

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Notifications are needed for survey reminders. Please enable them in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const requestUsageStatsPermission = async () => {
    if (Platform.OS === 'android') {
      // On Android, we need to direct user to Usage Access settings
      Alert.alert(
        'Usage Access Required',
        'To detect when you open social media apps, please grant usage access permission.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
              // We'll assume granted for now - in production you'd check again
              setPermissions((prev) => ({ ...prev, usageStats: true }));
            },
          },
        ]
      );
    } else {
      // iOS - will use Shortcuts, so no special permission needed
      setPermissions((prev) => ({ ...prev, usageStats: true }));
    }
  };

  const handleContinue = () => {
    navigation.navigate('AppSelection');
  };

  const canContinue = permissions.notifications && (Platform.OS === 'ios' || permissions.usageStats);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.subtitle}>
          We need a few permissions to make the study work properly.
        </Text>

        <View style={styles.permissionsContainer}>
          <Card style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={32}
                color={permissions.notifications ? COLORS.success : COLORS.primary}
              />
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Notifications</Text>
                <Text style={styles.permissionDescription}>
                  For survey reminders at 5pm and 9pm
                </Text>
              </View>
              {permissions.notifications && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={COLORS.success}
                />
              )}
            </View>
            {!permissions.notifications && (
              <Button
                title="Enable Notifications"
                onPress={requestNotificationPermission}
                mode="outlined"
                style={styles.permissionButton}
              />
            )}
          </Card>

          {Platform.OS === 'android' && (
            <Card style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <MaterialCommunityIcons
                  name="chart-timeline-variant"
                  size={32}
                  color={permissions.usageStats ? COLORS.success : COLORS.primary}
                />
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionTitle}>Usage Access</Text>
                  <Text style={styles.permissionDescription}>
                    To detect when you open social media apps
                  </Text>
                </View>
                {permissions.usageStats && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={COLORS.success}
                  />
                )}
              </View>
              {!permissions.usageStats && (
                <Button
                  title="Grant Access"
                  onPress={requestUsageStatsPermission}
                  mode="outlined"
                  style={styles.permissionButton}
                />
              )}
            </Card>
          )}

          {Platform.OS === 'ios' && (
            <Card style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={32}
                  color={COLORS.primary}
                />
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionTitle}>Shortcuts Setup</Text>
                  <Text style={styles.permissionDescription}>
                    We'll guide you through setting up automations (like OneSec)
                  </Text>
                </View>
              </View>
              <Text style={styles.iosNote}>
                You'll set this up after selecting which apps to track.
              </Text>
            </Card>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!canContinue}
          />
          {!canContinue && (
            <Text style={styles.footerNote}>
              Please grant the required permissions to continue
            </Text>
          )}
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
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionsContainer: {
    flex: 1,
  },
  permissionCard: {
    marginBottom: 16,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  permissionButton: {
    marginTop: 16,
  },
  iosNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 24,
  },
  footerNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
});
