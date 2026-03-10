import React from 'react';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

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
  return <RootNavigator />;
}

