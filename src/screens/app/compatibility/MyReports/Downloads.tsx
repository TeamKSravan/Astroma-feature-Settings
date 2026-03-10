import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Love } from '../../../../constants/svgpath';
import { colors } from '../../../../constants/colors';
import { fonts } from '../../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import imagepath from '../../../../constants/imagepath';
import BaseView from '../../../../utils/BaseView';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../../../components/Loader';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useCompatibilityStore } from '../../../../store/useCompatibilityStore';
import PdfViewerModal from '../../../../components/modals/PdfViewerModal';
import CompatibilityProfiles from '../../../../components/CompatibilityProfiles';
import i18n from '../../../../translation/i18n';
import CategorySign from '../../../../components/CategorySign';

export default function ExploreReports() {
  const { isLoading } = useAuthStore();
  const { getCompatibilityReportList } = useCompatibilityStore();
  const [reports, setReports] = useState<Array<any>>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>('');
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfData, setPdfData] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getCompatibilityReportList(false).then(response => {
      if (response.success) {
        setReports(response.data as any);
        setEmptyMessage('');
      } else {
        setEmptyMessage(i18n.t('report.noCompatibilityReports'));
      }
    }).finally(() => setRefreshing(false));
  }, [getCompatibilityReportList]);

  useEffect(() => {
    getCompatibilityReportList(false).then(response => {
      if (response.success) {
        console.log('Reports Response:', response.data);
        setReports(response.data as any);
      } else {
        console.log('Error:', response.message);
        setEmptyMessage(i18n.t('report.noCompatibilityReports'));
        // setEmptyMessage(response.message as string);
      }
    });
  }, []);

  const onPressItem = (item: any, index: number) => {
    console.log('Item pressed:', item, 'Index:', index);
    setPdfData(item);
    setShowPdfViewerModal(true);

  };
  function capitalizeFirstLetter(str) {
    if (!str) return "";
  
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity style={styles.bgView} onPress={() => onPressItem(item, index)}>
      <Image source={imagepath.planetBg} style={styles.imbg} />
      <View style={styles.compatView}>
        <CategorySign sign={item?.compatibility?.type} />
        <Text style={styles.compatText}>{` ${capitalizeFirstLetter(item?.compatibility?.type)} ${item?.is_comparison ? 'Compare' : 'Compatibility'}`}</Text>
      </View>
      <CompatibilityProfiles profiles={item?.profiles || []} />
      <View style={styles.purpleView}>
        <Text style={styles.purpleText}>{item?.compatibility?.type}</Text>
      </View>
      <View style={styles.descriptionGradient2}>
        <Text numberOfLines={4} style={styles.contextText}>{item?.compatibility?.prompt}</Text>
        <LinearGradient
          colors={[colors.neutral950, 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.descriptionGradient}
        >
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const typeLabel = pdfData?.compatibility?.type ? `${pdfData.compatibility.type.charAt(0).toUpperCase()}${pdfData.compatibility.type.slice(1)}` : '';
  const ScreenTitle = `${typeLabel} ${i18n.t('compat.compatibilityReport')}`;
  return (
    <>
      {isLoading && <Loader />}
      <FlatList
        data={reports}
        renderItem={renderItem}
        // bounces={false}
        contentContainerStyle={styles.scroll}
        ListEmptyComponent={<Text style={styles.emptyMessage}>{emptyMessage}</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
      <PdfViewerModal
        closeModal={() => { setShowPdfViewerModal(false) }}
        visible={showPdfViewerModal}
        pdfUrl={pdfData?.pdf_report}
        title={ScreenTitle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bgView: {
    backgroundColor: colors.neutral950,
    maxHeight: 170,
    padding: scale(20),
    marginBottom: verticalScale(14),
    borderRadius: scale(14),
    borderWidth: 0.2,
    borderColor: colors.white,
  },
  compatView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(20),
  },
  imbg: {
    alignSelf: 'flex-end',
    position: 'absolute',
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
  line: {
    height: 14,
    borderEndWidth: 0.5,
    borderColor: colors.white,
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
    bottom: 10
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
});
