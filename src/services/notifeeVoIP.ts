/**
 * VoIP-style incoming call notification via Notifee.
 * High-priority channel (Android), Accept (opens app) / Decline (dismisses).
 */

import notifee, { AndroidImportance, AuthorizationStatus, EventType } from '@notifee/react-native';
import type { Event } from '@notifee/react-native';
import { Platform } from 'react-native';

const VOIP_CHANNEL_ID = 'voip_incoming_call';
const VOIP_NOTIFICATION_ID = 'voip_call_1';
const CATEGORY_ID_CALL = 'incoming_call';

export async function createVoIPChannel(): Promise<string> {
  if (Platform.OS !== 'android') return VOIP_CHANNEL_ID;
  await notifee.createChannel({
    id: VOIP_CHANNEL_ID,
    name: 'Incoming calls',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
  return VOIP_CHANNEL_ID;
}

export async function registerIOSCallCategory(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  await notifee.setNotificationCategories([
    {
      id: CATEGORY_ID_CALL,
      actions: [
        { id: 'accept', title: 'Accept' },
        { id: 'decline', title: 'Decline' },
      ],
    },
  ]);
}

/**
 * Request notification permission (required on Android 13+ and iOS).
 * Call before displaying notifications.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
}

/**
 * Display VoIP-style incoming call notification with Accept and Decline.
 * Accept: opens app. Decline: dismisses notification (handled in event).
 */
export async function showIncomingCallNotification(): Promise<string> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    throw new Error('Notification permission denied. Enable notifications for LetsStream in Settings.');
  }

  await createVoIPChannel();
  await registerIOSCallCategory();

  const notification = {
    id: VOIP_NOTIFICATION_ID,
    title: 'Incoming call',
    body: 'LetsStream video call',
    android: {
      channelId: VOIP_CHANNEL_ID,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default', launchActivity: 'default' },
      actions: [
        {
          title: 'Accept',
          pressAction: { id: 'accept' },
        },
        {
          title: 'Decline',
          pressAction: { id: 'decline' },
        },
      ],
    },
    ios: {
      categoryId: CATEGORY_ID_CALL,
      critical: false,
    },
  };

  return notifee.displayNotification(notification);
}

/**
 * Handle Notifee events: Accept opens app (default), Decline dismisses.
 * Call this from onForegroundEvent and from onBackgroundEvent.
 */
export function handleVoIPEvent(event: Event): void {
  const { type, detail } = event;
  const actionId = detail.pressAction?.id;

  if (type === EventType.ACTION_PRESS) {
    if (actionId === 'decline') {
      if (detail.notification?.id) {
        notifee.cancelNotification(detail.notification.id);
      }
    }
    // 'accept': opening app is handled by launchActivity / default tap behaviour
  }
}
