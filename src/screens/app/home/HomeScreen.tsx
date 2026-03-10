import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import i18n from '../../../translation/i18n';
import { colors } from '../../../constants/colors';
import {
  fonts,
  height,
  signs,
  width,
  zodiacSigns,
} from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { Add, Coin, Left, Profile1, Right, Setting, Yellow } from '../../../constants/svgpath';
import LuckySection from '../../../components/LuckySection';
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
import { ToastMessage } from '../../../components/ToastMessage';

export default function HomeScreen(props: any) {

  const { isGetBonus, setIsGetBonus, userDetails } = useAuthStore();
  const { getDashboardData } = useHomeStore.getState();
  const [coinAmount, setCoinAmount] = useState(50);
  const [overview, setOverview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [userList, setUserList] = useState<Array<any>>([]);
  const [zodicSign, setZodicSign] = useState<string>('');
  const [signs, setSigns] = useState([
    { label: i18n.t('home.sunSign'), value: 'Gemini' },
    { label: i18n.t('home.moonSign'), value: 'Leo' },
    { label: i18n.t('home.luckyNumber'), value: '0' },
    { label: i18n.t('home.luckyColor'), value: 'white' },
    { label: i18n.t('home.luckyTime'), value: '00:00' },
  ]);
  const [showReceiveBonusModal, setShowReceiveBonusModal] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { getUserDetail, secondaryUserdata, selectedUser, setSelectedUser } = useProfileStore();
  console.log('selectedUser : ', selectedUser);
  const { getPlanDetails, myLastSubscription, setCurrentSubscription } = useWalletStore();

  useEffect(() => {
    fetchUserDetail();
    getPlanDetails();  
  }, []);

  const fetchUserDetail = async () => {
    const result = await getUserDetail();
    
  };

  useEffect(() => {
    fetchMyLastSubscription();
  }, [myLastSubscription]);


  const fetchMyLastSubscription = async () => {
    const result = await myLastSubscription();
    if(result.success){
      console.log('My last subscription : ', result.data);
      setCurrentSubscription(result.data);
     }
  }

  useEffect(() => {
    if (isGetBonus) {
      setTimeout(() => {
        setShowReceiveBonusModal(true);
      }, 500);
      setTimeout(() => {
        setShowReceiveBonusModal(false);
      }, 3000);
    }
  }, [isGetBonus]);


  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const result = await getDashboardData(selectedUser?._id?.$oid ?? '');
      console.log('Dashboard data : ', result);
      if (result.success) {
        setOverview(result.overview);
        setPredictions(result.predictions);
        setSigns([
          { label: i18n.t('home.sunSign'), value: result?.predictions?.sun_sign },
          { label: i18n.t('home.luckyNumber'), value: result?.predictions?.lucky_number },
          { label: i18n.t('home.moonSign'), value: result?.predictions?.moon_sign },
          { label: i18n.t('home.luckyColor'), value: result?.predictions?.lucky_color },
          { label: i18n.t('home.luckyTime'), value: result?.predictions?.lucky_time },
        ]);
        setZodicSign(result?.predictions?.zodiac_sign);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [getDashboardData, selectedUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserDetail();
    await fetchMyLastSubscription();
    const result = await getDashboardData(selectedUser?._id?.$oid ?? '');
    if (result.success) {
      setOverview(result.overview);
      setPredictions(result.predictions);
      setSigns([
        { label: i18n.t('home.sunSign'), value: result?.predictions?.sun_sign },
        { label: i18n.t('home.luckyNumber'), value: result?.predictions?.lucky_number },
        { label: i18n.t('home.moonSign'), value: result?.predictions?.moon_sign },
        { label: i18n.t('home.luckyColor'), value: result?.predictions?.lucky_color },
        { label: i18n.t('home.luckyTime'), value: result?.predictions?.lucky_time },
      ]);
      setZodicSign(result?.predictions?.zodiac_sign);
    }
    setRefreshing(false);
  };
  return (

    <BaseView backgroundImage={imagepath.homeBg}>
      <View style={styles.headerView}>
        <View style={styles.helloView}>
          <Text style={styles.nameText}>{i18n.t('home.hello')} {selectedUser?.name?.split(" ")[0] ?? userDetails?.name?.split(" ")[0]}</Text>{/* selectedUser?.name ?? userDetails?.name */}
          <Text style={styles.dateText}>{moment(selectedUser?.date_of_birth ?? userDetails?.dateOfBirth).format('MMM DD, YYYY')} - {moment(selectedUser?.time_of_birth ?? userDetails?.timeOfBirth, ["HH:mm", "HHmm", "h:mm A"]).format('hh:mm A')}</Text>
          {/* <Text style={styles.dateText}>Sept 22, 1996- 09:45 AM</Text> */}
        </View>
        <View style={styles.coinView}>
          <TouchableOpacity onPress={() => props.navigation.navigate('Wallet', { showBack: true })}>
            <CoinComponent />
          </TouchableOpacity>
          <NotificationBell notificationCount={0} onPress={() => { props.navigation.navigate('Notification') }} />
          <TouchableOpacity onPress={() => props.navigation.navigate('SettingScreen')}>
            <Setting />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainView}>
        <ScrollView
          bounces={false}
          contentContainerStyle={{ paddingBottom: verticalScale(60) }}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
        >
          <View style={styles.profileView}>
            {(isLoading || refreshing) && <Loader />}
            <UserList primaryUser={userDetails ?? undefined} />
          </View>
          <View style={styles.circularView}>
            <View style={styles.yellowView}>
              <ZodicSign sign={zodicSign} width={scale(100)} height={scale(100)} />
              {/* <Yellow width={width * 0.36} /> */}
            </View>
            <View style={styles.nameView}>
              <Text style={styles.fullnameText}>{selectedUser?.name ?? userDetails?.name}</Text>
              {/* <Text style={styles.zodiacText}>Pisces - Married</Text> */}
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
              onPress={() => setOverviewExpanded(!overviewExpanded)}
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
            onPress={() =>
              props.navigation.navigate('BottomTabNavigator', {
                screen: 'AI Astrologer',
              })
            }
          />
        <ReceiveBonusModal closeModal={() => {
          setShowReceiveBonusModal(false)
          setIsGetBonus(false);
        }} visible={showReceiveBonusModal} />
      </View>
    </BaseView>
  );
}

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
