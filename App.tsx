import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import {
  initializePushNotifications,
  setupForegroundMessageHandler,
} from './src/services/NotificationServices';

LogBox.ignoreLogs([
  '[RN-IAP] Failed to initialize IAP connection',
  'Failed to initialize billing connection',
  'init-connection',
  '[fetchProducts] Failed',
  'Failed to request purchase',
  'PurchaseError',
  'Value is undefined, expected a String',
  'expected a String for android',
]);

export default function App() {
  useEffect(() => {
    initializePushNotifications().catch((err) =>
      console.error('Push notification init failed:', err)
    );
    const unsubscribe = setupForegroundMessageHandler();
    return () => unsubscribe();
  }, []);

  return <RootNavigator />;
}

