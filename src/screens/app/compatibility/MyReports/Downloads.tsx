import i18n from '../../../../translation/i18n';
import Loader from '../../../../components/Loader';
import { fonts } from '../../../../constants/fonts';
import { colors } from '../../../../constants/colors';
import { useAuthStore } from '../../../../store/useAuthStore';
import CCReportItem from '../../../../components/CCReportItem';
import React, { useCallback, useEffect, useState } from 'react';
import { useProfileStore } from '../../../../store/useProfileStore';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import PdfViewerModal from '../../../../components/modals/PdfViewerModal';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import { useCompatibilityStore } from '../../../../store/useCompatibilityStore';

export default function ExploreReports() {
  const { isLoading } = useAuthStore();
  const { getCompatibilityReportList } = useCompatibilityStore();
  const { selectedUser } = useProfileStore();
  const [reports, setReports] = useState<Array<any>>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>('');
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfData, setPdfData] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    getCompatibilityReportList(false, selectedUser?._id as string).then(response => {
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
        setReports(response.data as any);
      } else {
        setEmptyMessage(i18n.t('report.noCompatibilityReports'));
      }
    });
  }, []);

  const onPressItem = (item: any, index: number) => {
    setPdfData(item);
    setShowPdfViewerModal(true);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <CCReportItem item={item} index={index} onPress={onPressItem} />
  );

  const typeLabel = pdfData?.compatibility?.type ? `${pdfData.compatibility.type.charAt(0).toUpperCase()}${pdfData.compatibility.type.slice(1)}` : '';
  const ScreenTitle = `${typeLabel} ${i18n.t('compat.compatibilityReport')}`;
  return (
    <>
      {isLoading && <Loader />}
      <FlatList
        data={reports}
        renderItem={renderItem}
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
});
