import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import i18n from '../../../translation/i18n';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { Left, Right, Setting } from '../../../constants/svgpath';
import CustomButton from '../../../components/CustomButton';
import CoinComponent from '../../../components/CoinComponent';
import ReceiveBonusModal from '../../../components/modals/ReceiveBonus';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProfileStore } from '../../../store/useProfileStore';
import Loader from '../../../components/Loader';
import moment from 'moment';
import { useHomeStore } from '../../../store/useHomeStore';
import ZodicSign from '../../../components/ZodicSign';
import UserList from '../../../components/UserList';
import { useWalletStore } from '../../../store/useWalletStore';
import NotificationBell from '../../../components/NotificationBell';
import { capitalizeFirstLetter } from '../../../utils/methods';
import { useFocusEffect } from '@react-navigation/native';
import { getFCMToken, requestUserPermission } from '../../../services/NotificationServices';
import { Routes } from '../../../navigation/RouteNames';

const scrollContentStyle = { paddingBottom: verticalScale(60) };
const ZODIAC_SIZE = scale(100);

function HomeScreen(props: any) {
  const { isGetBonus, setIsGetBonus, userDetails, currentLanguage } = useAuthStore(); 
  const { getDashboardData, saveFCMToken } = useHomeStore.getState();
  const [overview, setOverview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);
  const [zodicSign, setZodicSign] = useState<string>('');
  const [showReceiveBonusModal, setShowReceiveBonusModal] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { getUserDetail, selectedUser } = useProfileStore();
  const { myLastSubscription, setCurrentSubscription } = useWalletStore();

  const lastFetchKeyRef = useRef<string>('');
  const userId = selectedUser?._id?.$oid ?? '';
  const fetchKey = `${userId}_${currentLanguage}`;

  const signs = useMemo(() => [
    { label: i18n.t('home.sunSign'), value: predictions?.sun_sign ?? 'Gemini' },
    { label: i18n.t('home.luckyNumber'), value: predictions?.lucky_number ?? '0' },
    { label: i18n.t('home.moonSign'), value: predictions?.moon_sign ?? 'Leo' },
    { label: i18n.t('home.luckyColor'), value: predictions?.lucky_color ?? 'white' },
    { label: i18n.t('home.luckyTime'), value: predictions?.lucky_time ?? '00:00' },
  ], [predictions, currentLanguage]);

  const applyDashboardResult = useCallback((result: any) => {
    if (result?.success) {
      setOverview(result.overview);
      setPredictions(result.predictions);
      setZodicSign(result.predictions?.zodiac_sign);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (lastFetchKeyRef.current === fetchKey) return;
      let cancelled = false;
      const doFetch = async () => {
        setIsLoading(true);
        const result = await getDashboardData(userId, { silent: true });
        if (cancelled) return;
        applyDashboardResult(result);
        if (result?.success) {
          lastFetchKeyRef.current = fetchKey;
        }
        setIsLoading(false);
      };
      doFetch();
      return () => { cancelled = true; };
    }, [fetchKey, userId, getDashboardData, applyDashboardResult])
  );

  useEffect(() => {
    const initScreen = async () => {
      const [, subscriptionResult] = await Promise.all([
        getUserDetail(undefined, { silent: true }),
        myLastSubscription(),
      ]);
      if (subscriptionResult?.success) {
        setCurrentSubscription(subscriptionResult.data);
      }
    };
    initScreen();

    const checkPermission = async () => {
      const hasPermission = await requestUserPermission();
      if (hasPermission) {
        const token = await getFCMToken();
        saveFCMToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    if (!isGetBonus) return;
    const showTimer = setTimeout(() => setShowReceiveBonusModal(true), 500);
    const hideTimer = setTimeout(() => setShowReceiveBonusModal(false), 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isGetBonus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const dashboardResult = await getDashboardData(userId, { silent: true });
      applyDashboardResult(dashboardResult);
      if (dashboardResult?.success) {
        lastFetchKeyRef.current = fetchKey;
      }
    } finally {
      setRefreshing(false);
    }
    void Promise.all([getUserDetail(undefined, { silent: true }), myLastSubscription()]).then(([, subscriptionResult]) => {
      if (subscriptionResult?.success) {
        setCurrentSubscription(subscriptionResult.data);
      }
    });
  }, [userId, fetchKey, getUserDetail, myLastSubscription, getDashboardData, setCurrentSubscription, applyDashboardResult]);

  const truncateText = useCallback((text: string | undefined, limit = 12) => {
    if (!text) return '';
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  }, []);

  const navigateToWallet = useCallback(() => {
    props.navigation.navigate(Routes.TransactionHistory);
  }, [props.navigation]);

  const navigateToNotification = useCallback(() => {
    props.navigation.navigate(Routes.Notification);
  }, [props.navigation]);

  const navigateToSettings = useCallback(() => {
    props.navigation.navigate(Routes.SettingScreen);
  }, [props.navigation]);

  const navigateToAi = useCallback(() => {
    props.navigation.navigate(Routes.BottomTabNavigator, { screen: Routes.AiAstrologer });
  }, [props.navigation]);

  const toggleOverview = useCallback(() => {
    setOverviewExpanded(prev => !prev);
  }, []);

  const closeBonusModal = useCallback(() => {
    setShowReceiveBonusModal(false);
    setIsGetBonus(false);
  }, [setIsGetBonus]);

  const displayName = useMemo(() =>
    truncateText(
      selectedUser?.name?.split(' ')[0] ?? userDetails?.name?.split(' ')[0],
      12,
    ),
    [selectedUser?.name, userDetails?.name, truncateText],
  );

  const formattedDate = useMemo(() => {
    const dob = selectedUser?.date_of_birth ?? userDetails?.dateOfBirth;
    const tob = selectedUser?.time_of_birth ?? userDetails?.timeOfBirth;
    return `${moment(dob).format('MMM DD, YYYY')} - ${moment(tob, ['HH:mm', 'HHmm', 'h:mm A']).format('hh:mm A')}`;
  }, [selectedUser?.date_of_birth, selectedUser?.time_of_birth, userDetails?.dateOfBirth, userDetails?.timeOfBirth]);

  const fullName = useMemo(
    () => capitalizeFirstLetter(selectedUser?.name ?? userDetails?.name ?? ''),
    [selectedUser?.name, userDetails?.name],
  );

  return (
    <BaseView backgroundImage={imagepath.homeBg}>
      <View style={styles.headerView}>
        <View style={styles.helloView}>
          <Text numberOfLines={1} style={styles.nameText}>
            {i18n.t('home.hello')} {displayName}
          </Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={styles.coinView}>
          <TouchableOpacity onPress={navigateToWallet}>
            <CoinComponent />
          </TouchableOpacity>
          <NotificationBell notificationCount={0} onPress={navigateToNotification} />
          <TouchableOpacity onPress={navigateToSettings}>
            <Setting />
          </TouchableOpacity>
        </View>
      </View>
      {showReceiveBonusModal && (
        <ReceiveBonusModal closeModal={closeBonusModal} visible={showReceiveBonusModal} />
      )}
      <View style={styles.mainView}>
        <ScrollView
          bounces={false}
          contentContainerStyle={scrollContentStyle}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.profileView}>
            {(isLoading || refreshing) && <Loader />}
            <UserList primaryUser={userDetails ?? undefined} />
          </View>
          <View style={styles.circularView}>
            <View style={styles.yellowView}>
              <ZodicSign sign={zodicSign} width={ZODIAC_SIZE} height={ZODIAC_SIZE} />
            </View>
            <View style={styles.nameView}>
              <Text style={styles.fullnameText}>{fullName}</Text>
              <View style={styles.optionsView}>
                {signs.map((sign, index) => (
                  <View key={index} style={styles.titleContainer}>
                    <Text style={styles.labelText}>{sign.label}</Text>
                    <Text style={styles.valueText}> {sign.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.overView}>
            <Left />
            <Text style={styles.overText}>{i18n.t('home.overview')}</Text>
            <Right />
          </View>
          <Text
            style={styles.paraText}
            numberOfLines={overviewExpanded ? undefined : 6}
          >
            {overview}
          </Text>
          {overview ? (
            <TouchableOpacity
              onPress={toggleOverview}
              style={styles.moreLessButton}
            >
              <Text style={styles.moreLessText}>
                {overviewExpanded ? i18n.t('home.less') : i18n.t('home.more')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>

        <CustomButton
          style={styles.chatWithAiButton}
          title={i18n.t('home.chatWithAi')}
          onPress={navigateToAi}
        />
      </View>
    </BaseView>
  );
}

export default React.memo(HomeScreen);

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    paddingBottom: verticalScale(60),
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: Platform.OS === 'ios' ? 0 : verticalScale(10),
  },
  helloView: {
    gap: verticalScale(4),
  },
  nameText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(20),
  },
  dateText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
  },

  coinView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  profileView: {
    // flexDirection: 'row',
  },
  fullnameText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: moderateScale(20),
  },
  chatWithAiButton: {
    // marginTop: verticalScale(20),
    marginHorizontal: scale(16),
    marginBottom: verticalScale(25),
  },
  circularView: {
    flexDirection: 'row',
    marginTop: verticalScale(16),
    paddingHorizontal: scale(20),
    gap: scale(16),
  },
  yellowView: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(30),
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameView: {
    gap: 4,
    flex: 1,
    marginTop: verticalScale(10),
    // flexShrink: 1,
  },
  optionsView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 6,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(14),
  },
  titleContainer: {
    flexDirection: 'row',
    borderWidth: 0.4,
    borderColor: colors.primary, // or colors.border
    borderRadius: scale(25),
    height: verticalScale(24),
    paddingHorizontal: scale(10),
    alignItems: 'center',
  },
  labelText: {
    color: colors.lightYellow,
    fontFamily: fonts.regular,
    fontSize: moderateScale(8),
  },
  valueText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(10),
  },
  overView: {
    flexDirection: 'row',
    marginTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  overText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(20),
  },
  paraText: {
    color: colors.lightYellow,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
    paddingHorizontal: scale(20),
  },
  moreLessButton: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(4),
  },
  moreLessText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(12),
  },
});
