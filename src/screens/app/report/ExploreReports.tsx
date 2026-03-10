import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ReportLock } from '../../../constants/svgpath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import imagepath from '../../../constants/imagepath';
import BaseView from '../../../utils/BaseView';
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


export default function ExploreReports() {
  const lowerLimit = 10;
  const { isLoading } = useAuthStore();
  const { selectedUser } = useProfileStore();
  const { getWalletDetails, availableCoins } = useWalletStore();
  const { getRemainingReports, AddUserReports, getUserReports } = useChatStore();
  const [reports, setReports] = useState<Array<any>>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState({ id: 1, label: i18n.t('wallet.coins10'), specialOffer: false, subscription: false, cost: 3 },);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);


  const fetchReports = () => {
    getRemainingReports(selectedUser?._id?.$oid ?? '').then(response => {
      if (response.success) {
        console.log('Reports Response:', response.data);
        setReports(response.data as any);
      } else {
        console.log('Error:', response.message);
        setEmptyMessage(response.message as string);
      }
    });
  }

  const onPressItem = (item: any, index: number) => {
    if (availableCoins >= lowerLimit) {
      ManageSectPackage(item, index);
    } else {
      ToastMessage('You do not have enough coins(10 coins) to unlock this report');
    }
  };

  const ManageSectPackage = (item: any, index: number) => {
    console.log('Item pressed:', item, 'Index:', index);
    setShowOrderSummaryModal(true);
    setSelectedReport(item);
    setSelectedPackage({ id: item?._id?.$oid, label: item?.name, specialOffer: false, subscription: false, cost: 10 });
  }

  const handleAddCoins = () => {
    AddUserReports(selectedReport?._id, selectedUser?._id?.$oid ?? '')
      .then(async (response) => {
        console.log('AddUserReports Response:', response);
        if (response.success) {
          setSelectedReport(null);
          fetchReports();
          await getWalletDetails();
          ToastMessage("Report downloaded successfully");
        } else {
          ToastMessage("Failed to download report");
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity style={styles.bgView} onPress={() => onPressItem(item, index)}>
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
        <Text numberOfLines={3} style={styles.contextText}>{item?.description} lk;asndn a d;laksdj ;adj;a kdjas;lkd jas;lkd ja;sdj;asdj a;spka;lskdj ;apkdja;spdj a;lopskdj ;alksjd;aolksjd;alksjnjdakl;sn al;ksjndlk;jasn dlkajsnd lkas ndlaksn;lknka ds;las ;dakjd ;ada;klsdjas;ld kjas;djas;dkjas;l dkjasd;kjasd ;laksj;laskdja;s ka;kdj</Text>
        <LinearGradient
          colors={[colors.neutral950, 'transparent']}
          start={{ x: 0, y: 0.8 }}
          end={{ x: 0, y: 0 }}
          style={styles.descriptionGradient}
        >
        </LinearGradient>
      </View>
      <View style={styles.redView}>
        <Text style={styles.purpleText}>
          10 Coins
        </Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <BaseView backgroundImage={imagepath.reportBg}>
      {isLoading && <Loader />}
      <FlatList
        data={reports}
        renderItem={renderItem}
        bounces={false}
        contentContainerStyle={styles.scroll}
        ListEmptyComponent={<Text style={styles.emptyMessage}>{emptyMessage}</Text>}
      />
      {availableCoins < lowerLimit &&
        <View style={styles.emptyCreditsContainer}>
          <EmptyCredits />
        </View>}
      <CoinSummaryModal
        closeModal={() => { setShowOrderSummaryModal(false) }}
        visible={showOrderSummaryModal}
        paynow={handleAddCoins}
        title={`Download ${selectedPackage?.label}`}
        cost={10}
      />
    </BaseView>
  );
}

const styles = StyleSheet.create({
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
