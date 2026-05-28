import {
  AppState,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReportLock } from '../../../constants/svgpath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import imagepath from '../../../constants/imagepath';
import { useChatStore } from '../../../store/useChatStore';
import LinearGradient from 'react-native-linear-gradient';
import i18n from '../../../translation/i18n';
import { ToastMessage } from '../../../components/ToastMessage';
import Loader from '../../../components/Loader';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProfileStore } from '../../../store/useProfileStore';
import { useWalletStore } from '../../../store/useWalletStore';
import EmptyCredits from '../../../components/EmptyCredits';
import CoinSummaryModal from '../../../components/modals/CoinSummary';
import CategorySign, { Type } from '../../../components/CategorySign';
import DownloadSuccess from '../../../components/modals/DownloadSuccess';
import { useFocusEffect } from '@react-navigation/native';


const LOWER_LIMIT = 10;
const GRADIENT_COLORS: string[] = [colors.neutral950, 'transparent'];
const GRADIENT_START = { x: 0, y: 0.8 };
const GRADIENT_END = { x: 0, y: 0 };

function ExploreReports(props: any) {
  const { isLoading, userDetails } = useAuthStore();
  const { selectedUser } = useProfileStore();
  const { availableCoins, setAvailableCoins } = useWalletStore();
  const { getRemainingReports, AddUserReports } = useChatStore();
  const [reports, setReports] = useState<Array<any>>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [showDownloadSuccessModal, setShowDownloadSuccessModal] = useState(false);

  const lastFetchKeyRef = useRef<string>('');
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingOnResumeRef = useRef(false);
  const userId = (selectedUser as any)?._id?.$oid ?? userDetails?.id;
  const fetchReports = useCallback((userIdParam: string) => {
    return getRemainingReports(userIdParam).then(response => {
      if (response.success) {
        setReports(response.data as any);
        lastFetchKeyRef.current = userIdParam;
      }
    });
  }, [getRemainingReports]);

  useFocusEffect(
    useCallback(() => {
      if (lastFetchKeyRef.current === userId) return;
      fetchReports(userId);
    }, [userId, fetchReports])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active' || isRefreshingOnResumeRef.current) {
        return;
      }
      isRefreshingOnResumeRef.current = true;
      fetchReports(userId).finally(() => {
        isRefreshingOnResumeRef.current = false;
      });
    });

    return () => {
      subscription.remove();
    };
  }, [fetchReports, userId]);

  const onPressItem = useCallback((item: any) => {
    if (availableCoins >= LOWER_LIMIT) {
      setShowOrderSummaryModal(true);
      setSelectedReport(item);
      setSelectedPackage({
        id: item?._id?.$oid,
        label: item?.name,
        specialOffer: false,
        subscription: false,
        cost: 10,
      });
    } else {
      ToastMessage(i18n.t('toast.notEnoughCoins'));
    }
  }, [availableCoins]);

  const handleAddCoins = useCallback(() => {
    AddUserReports(selectedReport?._id, userId)
      .then(async (response) => {
        if (response.success) {
          setSelectedReport(null);
          lastFetchKeyRef.current = '';
          fetchReports(userId);
          setAvailableCoins((response as any)?.coins ?? 0);
          setShowDownloadSuccessModal(true);

          if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
          downloadTimerRef.current = setTimeout(() => {
            setShowDownloadSuccessModal(false);
          }, 3000);
        } else {
          ToastMessage(i18n.t('toast.failedToDownloadReport'));
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }, [selectedReport, userId, AddUserReports, setAvailableCoins, fetchReports]);

  const closeOrderSummary = useCallback(() => setShowOrderSummaryModal(false), []);
  const closeDownloadSuccess = useCallback(() => setShowDownloadSuccessModal(false), []);
  const keyExtractor = useCallback((item: any) => item?._id?.$oid ?? item?._id, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity style={styles.bgView} onPress={() => onPressItem(item)}>
      <Image source={imagepath.planetBg} style={styles.imbg} />
      <View style={styles.compatView}>
        <CategorySign sign={item?.type} width={20} height={20} type={Type.color} />
        <Text numberOfLines={1} ellipsizeMode='tail' style={styles.compatText}>{item?.name}</Text>
        <ReportLock style={styles.reportLock} />
      </View>
      <Text numberOfLines={1} ellipsizeMode='tail' style={styles.relationText}>{item?.sub_title}</Text>
      <View style={styles.purpleView}>
        <Text style={styles.purpleText}>{item?.type}</Text>
      </View>
      <View style={styles.descriptionGradient2}>
        <Text numberOfLines={3} style={styles.contextText}>{item?.description}</Text>
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={styles.descriptionGradient}
        />
      </View>
      <View style={styles.redView}>
        <Text style={styles.purpleText}>10 Coins</Text>
      </View>
    </TouchableOpacity>
  ), [onPressItem]);

  const downloadSuccessModal = useMemo(() => (
    <DownloadSuccess
      title="Report Successfully Downloaded"
      cost={10}
      closeModal={closeDownloadSuccess}
      visible={showDownloadSuccessModal}
    />
  ), [showDownloadSuccessModal, closeDownloadSuccess]);

  const listEmptyComponent = useMemo(() => (
    <Text style={styles.emptyMessage}>{i18n.t('report.allReportsUnlocked')}</Text>
  ), []);

  const reportsList = useMemo(() => (
    isLoading ? <Loader /> : (
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        bounces={false}
        contentContainerStyle={styles.scroll}
        ListEmptyComponent={listEmptyComponent}
      />
    )
  ), [isLoading, reports, renderItem, keyExtractor, listEmptyComponent]);

  const emptyCredits = useMemo(() => (
    availableCoins < LOWER_LIMIT ? (
      <View style={styles.emptyCreditsContainer}>
        <EmptyCredits />
      </View>
    ) : null
  ), [availableCoins]);

  const orderSummaryModal = useMemo(() => (
    showOrderSummaryModal ? (
      <CoinSummaryModal
        closeModal={closeOrderSummary}
        visible={showOrderSummaryModal}
        paynow={handleAddCoins}
        title={selectedPackage?.label}
        cost={10}
      />
    ) : null
  ), [showOrderSummaryModal, closeOrderSummary, handleAddCoins, selectedPackage?.label]);

  return (
    <View style={styles.container}>
      {downloadSuccessModal}
      {reportsList}
      {emptyCredits}
      {orderSummaryModal}
    </View>
  );
}

export default React.memo(ExploreReports);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? verticalScale(25) : 0,
  },
  bgView: {
    backgroundColor: colors.neutral950,
    maxHeight: 170,
    padding: scale(20),
    marginBottom: verticalScale(14),
    borderRadius: scale(14),
  },
  compatView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(20),
    marginLeft: scale(5),
  },
  imbg: {
    alignSelf: 'flex-end',
    position: 'absolute',
  },
  relationText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: moderateScale(12),
    marginTop: verticalScale(6),
  },
  purpleView: {
    backgroundColor: colors.darkPurple,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    borderRadius: scale(4),
    paddingVertical: verticalScale(2),
    paddingHorizontal: scale(10),
    marginTop: verticalScale(4),
  },
  purpleText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(10),
  },
  contextText: {
    color: colors.lightGray,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(10),
    marginTop: verticalScale(10),
  },
  redView: {
    backgroundColor: colors.red,
    alignSelf: 'flex-end',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(2),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(6),
    marginTop: verticalScale(10),
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  scroll: {
    paddingBottom: verticalScale(60),
    paddingHorizontal: scale(10),
  },
  emptyMessage: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  descriptionGradient: {
    position: 'absolute',
    height: scale(50),
    width: '100%',
  },
  descriptionGradient2: {
    height: scale(50),
  },
  reportLock: {
    position: 'absolute',
    right: 0,
    top: 30,
  },
  emptyCreditsContainer: {
    marginBottom: verticalScale(50),
  },
});
