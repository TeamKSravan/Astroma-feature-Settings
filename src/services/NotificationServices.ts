import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { useHomeStore } from '../store/useHomeStore';

const CHANNEL_ID = 'default';

/**
 * Display a notification using react-native-push-notification.
 * Used when Firebase receives a message (foreground) or we need to show data-only messages.
 */
function displayNotification(
  title: string,
  body: string,
  data?: Record<string, string>
) {
  PushNotification.localNotification({
    ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
    title,
    message: body,
    ...(data && { userInfo: data }),
  });
}

// Must be called at top level - outside any component
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const title =
    remoteMessage.notification?.title ||
    (typeof remoteMessage.data?.title === 'string' ? remoteMessage.data.title : '') ||
    'Astroma';
  const body =
    remoteMessage.notification?.body ||
    (typeof remoteMessage.data?.message === 'string' ? remoteMessage.data.message : '') ||
    (typeof remoteMessage.data?.body === 'string' ? remoteMessage.data.body : '') ||
    '';
  displayNotification(title, body, remoteMessage.data as Record<string, string>);
});

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log('Notification permission granted');
  }
  return enabled;
}

export async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

/**
 * Initialize push notifications. Call this on app start (e.g. in App.tsx).
 */
export async function initializePushNotifications() {
  // 1. Create Android notification channel
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: CHANNEL_ID,
        channelName: 'Default',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created: boolean) => console.log(`Notification channel created: ${created}`)
    );
  }

  // 2. Configure react-native-push-notification (for local notifications & taps)
  PushNotification.configure({
    onRegister: async (token: { token: string }) => {
      console.log('Push token:', token);
      await useHomeStore.getState().saveFCMToken(token.token);
    },
    onNotification: (notification: { userInteraction?: boolean; data?: Record<string, unknown> }) => {
      console.log('Notification received/opened:', notification);
      if (notification.userInteraction) {
        // User tapped notification - handle navigation if needed
        // e.g. navigation.navigate('Notification', { id: notification.data?.id });
      }
    },
    onAction: (notification: { action: string }) => {
      console.log('Notification action:', notification.action);
    },
    onRegistrationError: (err: Error) => {
      console.error('Notification registration error:', err);
    },
    permissions: { alert: true, badge: true, sound: true },
    popInitialNotification: true,
    requestPermissions: true,
  });

  // 3. Request permission and get FCM token
  const hasPermission = await requestUserPermission();
  return null;
}

/**
 * Set up Firebase foreground message listener.
 * Foreground messages are NOT shown automatically - we must display them.
 */
export function setupForegroundMessageHandler() {
  return messaging().onMessage(async (remoteMessage) => {
    const title =
      remoteMessage.notification?.title ||
      (typeof remoteMessage.data?.title === 'string' ? remoteMessage.data.title : '') ||
      'Astroma';
    const body =
      remoteMessage.notification?.body ||
      (typeof remoteMessage.data?.message === 'string' ? remoteMessage.data.message : '') ||
      (typeof remoteMessage.data?.body === 'string' ? remoteMessage.data.body : '') ||
      '';
    displayNotification(title, body, remoteMessage.data as Record<string, string>);
  });
}