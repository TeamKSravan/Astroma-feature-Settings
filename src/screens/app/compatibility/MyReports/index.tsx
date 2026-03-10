import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { TabView } from 'react-native-tab-view';
import BaseView from '../../../../utils/BaseView';
import imagepath from '../../../../constants/imagepath';
import CommonHeader from '../../../../components/CommonHeader';
import i18n from '../../../../translation/i18n';
import { BackArrow, BackArrow2, BackButton } from '../../../../constants/svgpath';
import { colors } from '../../../../constants/colors';
import { fonts } from '../../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import CompatibilityReports from './CompatibilityReports';
import CompareReports from './CompareReports';

const { width } = Dimensions.get('window');

export default function MyReportScreen(props: any) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'compatibilityReports', title: i18n.t('compat.compatibilityReports') },
    { key: 'compareReports', title: i18n.t('compat.compareReports') },
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

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'compatibilityReports':
        return <CompatibilityReports />;
      case 'compareReports':
        return <CompareReports tabIndex={index} />;
      default:
        return null;
    }
  };

  return (
    <BaseView backgroundImage={imagepath.reportBg}>
      <CommonHeader
        LeftComponent={
          <View style={styles.leftContainer}>
            <BackButton onPress={() => props.navigation.goBack()} />
            <Text style={styles.leftText}>{i18n.t('compat.generatedReports')}</Text>
          </View>}
        onWalletPress={() => props.navigation.navigate('Wallet', { showBack: true })}
        RightComponent={<View />}
      />
      <TabView
        navigationState={{ index, routes }}
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
