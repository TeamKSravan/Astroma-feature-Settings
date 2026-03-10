import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { TabView, SceneMap } from 'react-native-tab-view';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import CommonHeader from '../../../components/CommonHeader';
import i18n from '../../../translation/i18n';
import Compatibility from './Compatibility';
import Compare from './Compare';
import Downloads from './MyReports/Downloads';
import { Comparee, ReportHistory } from '../../../constants/svgpath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { useCompatibilityStore } from '../../../store/useCompatibilityStore';

const { width } = Dimensions.get('window');

const renderScene = SceneMap({
  compatibility: Compatibility,
  compare: Compare,
  downloads: Downloads,
});

export default function MainScreen(props: any) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'compatibility', title: i18n.t('compat.com') },
    { key: 'compare', title: i18n.t('compat.compare') },
    { key: 'downloads', title: i18n.t('report.downloads') },
  ]);


  const renderTabBar = (props: any) => {
    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.segmentedControl}>
          {props.navigationState.routes.map((route: any, i: number) => {
            const isActive = index === i;
            return (
              <TouchableOpacity
                key={route.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setIndex(i)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {route.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <BaseView backgroundImage={imagepath.CompatBg}>
      <CommonHeader
        LeftComponent={
          <View style={styles.leftContainer}>
            <Comparee />
            <Text style={styles.leftText}>{i18n.t('compat.compat')}</Text>
          </View>}
        // title={i18n.t('compat.compat')}
        onWalletPress={() => props.navigation.navigate('Wallet', { showBack: true })}
        RightComponent={<View />}
      />

      <TabView
        navigationState={{ index, routes: routes.map((route: any) => ({ ...route, params: { index } })) }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={renderTabBar}
        style={styles.tabView}
        swipeEnabled={true}
      />
    </BaseView>
  );
}

const styles = StyleSheet.create({
  tabView: {
    flex: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  rightContainer: {
    alignItems: 'center',
    marginLeft: scale(8),
  },
  leftText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
  },
  tabBarContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(18),
    backgroundColor: 'transparent',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.dusty,
    borderRadius: moderateScale(25),
    padding: moderateScale(4),
    height: verticalScale(36),
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(22),
    paddingVertical: verticalScale(2),
  },
  tabButtonActive: {
    backgroundColor: colors.primarylight,
  },
  tabButtonText: {
    fontSize: moderateScale(14),
    fontFamily: fonts.regular,
    color: colors.white,
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: colors.black,
    fontFamily: fonts.regular,
  },
});
