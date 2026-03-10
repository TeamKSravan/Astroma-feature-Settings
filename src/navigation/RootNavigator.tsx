import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashComponent from '../components/SplashComponent';
import { useAuthStore } from '../store/useAuthStore';
import {
  initializeIAP,
  setupPurchaseListeners,
  removePurchaseListeners,
  checkPendingPurchases,
} from '../services/iapService';
import i18n from '../translation/i18n';
import { useWalletStore } from '../store/useWalletStore';
import { ToastProvider } from 'react-native-toast-notifications'

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, token, userDetails, currentLanguage } = useAuthStore();

  useEffect(() => {
    i18n.locale = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('auhenticated ran,');
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping IAP initialization');
      return;
    }

    console.log('User authenticated - initializing IAP once...');

    const initIAPForAuthenticatedUser = async () => {
      try {
        // dispatch(fetchSubscriptionFromBackend());
        await initializeIAP();
        console.log('IAP connection established');
        setupPurchaseListeners(purchase => { });
        console.log('IAP listeners active');
        // const pendingResult = await checkPendingPurchases(purchase => {});

        // if (pendingResult.count > 0) {
        //   console.log(`Cleaned up ${pendingResult.count} pending purchases`);
        // }

        console.log('IAP fully initialized and ready!');
      } catch (error) {
        console.error('Failed to initialize IAP:', error);
      }
    };

    initIAPForAuthenticatedUser();

    return () => {
      console.log('User logged out - cleaning up IAP...');
      removePurchaseListeners();
    };
  }, [isAuthenticated]);

  if (showSplash) {
    return <SplashComponent />;
  }
  console.log('isAuthenticated', isAuthenticated);
  console.log('token', token);
  console.log('userDetails', userDetails);
  return (
    <ToastProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {(!isAuthenticated || !token || !userDetails?.isOnboarded) &&
            <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
            || <Stack.Screen name="AppNavigator" component={AppNavigator} />}
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}
