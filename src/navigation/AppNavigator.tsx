import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ChatScreen from '../screens/app/ai/ChatScreen';
import MyReports from '../screens/app/compatibility/MyReports';
import SettingScreen from '../screens/app/home/Settings';
import UserProfile from '../screens/app/home/Settings/UserProfile';
import TransactionHistory from '../screens/app/home/Settings/TransactionHistory';
import OnboardingScreen from '../screens/auth/onboarding/OnboardingScreen';
import PdfViewerScreen from '../screens/app/compatibility/MyReports/PdfViewer';
import ContactUs from '../screens/app/home/Settings/ContactUs';
import Profile from '../screens/app/home/Settings/Profile';
import WalletScreen from '../screens/app/wallet/WalletScreen';
import ChatHistory from '../screens/app/ai/ChatHistory';
import { MenuProvider } from 'react-native-popup-menu';
import { Platform } from 'react-native';
import AiAstrologer from '../screens/app/ai/AiAstrologer';
import Notification from '../screens/app/home/Notification';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <MenuProvider>
      {/* <Stack.Navigator initialRouteName={userDetails?.isOnboarded ? "BottomTabNavigator" : "OnboardingScreen"} screenOptions={{ headerShown: false }}> */}
      <Stack.Navigator initialRouteName={"BottomTabNavigator"} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ gestureEnabled: Platform.OS === 'ios' ? false : true }}/>
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
        <Stack.Screen name="AiAstrologer" component={AiAstrologer} />
        <Stack.Screen name="MyReports" component={MyReports} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="ContactUs" component={ContactUs} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="ChatHistory" component={ChatHistory} />
        <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
        <Stack.Screen name="Notification" component={Notification} />
      </Stack.Navigator>
    </MenuProvider>
  );
}
