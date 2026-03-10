import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { moderateScale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import HomeScreen from '../screens/app/home/HomeScreen';
import AiAstrologer from '../screens/app/ai/AiAstrologer';
import ChatScreen from '../screens/app/ai/ChatScreen';
import ChatHistory from '../screens/app/ai/ChatHistory';
import Compatibility from '../screens/app/compatibility/Compatibility';
import ReportScreen from '../screens/app/report/ReportScreen';
import WalletScreen from '../screens/app/wallet/WalletScreen';
import { Ai, Comp, Home, Report, Wallet } from '../constants/svgpath';
import MainScreen from '../screens/app/compatibility/MainScreen';
import { useWalletStore } from '../store/useWalletStore';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();
  const { availableCoins } = useWalletStore();
  const lowerCount = 1;
  const dynamicTabBarStyle = {
    ...styles.tabBarStyle,
    paddingBottom: Platform.OS === 'ios' 
      ? verticalScale(25) 
      : verticalScale(10) + insets.bottom,
    height: Platform.OS === 'ios' 
      ? verticalScale(80) 
      : verticalScale(65) + insets.bottom,
  };

  const shouldHideTabBar = (currentRouteName: string) =>
    currentRouteName === 'AI Astrologer' && availableCoins >= lowerCount;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: styles.sceneContainer,
        tabBarStyle: dynamicTabBarStyle,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.lightGray,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}
      // tabBar={(props) => {
      //   const currentRouteName = props.state.routes[props.state.index]?.name ?? '';
      //   if (shouldHideTabBar(currentRouteName)) {
      //     return null;
      //   }
      //   return <BottomTabBar {...props} />;
      // }}
    >
      <Tab.Screen
        name="Horoscope"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Home
                width={moderateScale(24)}
                height={moderateScale(24)}
                fill={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AI Astrologer"
        component={availableCoins >= lowerCount ? ChatScreen : AiAstrologer}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ai
                width={moderateScale(24)}
                height={moderateScale(24)}
                fill={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Compatibility"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Comp
                width={moderateScale(24)}
                height={moderateScale(24)}
                fill={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Report
                width={moderateScale(24)}
                height={moderateScale(24)}
                fill={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Wallet
                width={moderateScale(24)}
                height={moderateScale(24)}
                fill={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  tabBarStyle: {
    backgroundColor: colors.black,
    borderTopWidth: 0.3,
    paddingTop: verticalScale(4),
    elevation: 0,
    shadowOpacity: 0,
    borderTopColor: colors.lightGray,
    position: 'absolute',
  },
  tabBarBackground: {
    flex:1,
    backgroundColor: colors.black,
  },
  tabBarLabelStyle: {
    fontFamily: fonts.regular,
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
    marginBottom: verticalScale(2),
  },
  tabBarItemStyle: {
    paddingVertical: verticalScale(6),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: verticalScale(10),
  },
});
