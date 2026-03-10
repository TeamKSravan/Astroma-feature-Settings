import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/auth/onboarding/WelcomeScreen';
import LoginScreen from '../screens/auth/login/LoginScreen';
import OnboardingScreen from '../screens/auth/onboarding/OnboardingScreen';
import OtpScreen from '../screens/auth/login/OtpScreen';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { hasSeenWelcome } = useAuthStore();

  const getInitialRoute = () => {
    if (hasSeenWelcome) {
      return 'LoginScreen';
    }

    return 'WelcomeScreen';
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRoute()}
    >
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />

      <Stack.Screen name="OtpScreen" component={OtpScreen} />
    </Stack.Navigator>
  );
}
