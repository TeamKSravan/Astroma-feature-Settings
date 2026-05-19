import i18n from '../../../../translation/i18n';
import Loader from '../../../../components/Loader';
import { fonts } from '../../../../constants/fonts';
import { colors } from '../../../../constants/colors';
import CCReportItem from '../../../../components/CCReportItem';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useProfileStore } from '../../../../store/useProfileStore';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import PdfViewerModal from '../../../../components/modals/PdfViewerModal';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import { useCompatibilityStore } from '../../../../store/useCompatibilityStore';
import { useFocusEffect } from '@react-navigation/native';

function Downloads(props: any) {
  const { index } = props.route.params;
  const { getCompatibilityReportList } = useCompatibilityStore();
  const { selectedUser } = useProfileStore();
  const [reports, setReports] = useState<Array<any>>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>('');
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfData, setPdfData] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lastFetchKeyRef = useRef<string | null>(null);

  const fetchReports = useCallback((userId: string, silent = false) => {
    if (!silent) setIsLoading(true);
    return getCompatibilityReportList(false, userId).then(response => {
      if (response.success) {
        setReports(response.data as any);
        setEmptyMessage('');
      } else {
        setEmptyMessage(i18n.t('report.noCompatibilityReports'));
      }
    }).finally(() => {
      if (!silent) setIsLoading(false);
    });
  }, [getCompatibilityReportList]);

  useFocusEffect(
    useCallback(() => {
      if (index !== 2) return;
      const fetchKey = `${selectedUser?._id?.$oid ?? ''}_${index}`;
      if (lastFetchKeyRef.current === fetchKey) return;
      lastFetchKeyRef.current = fetchKey;
      fetchReports(selectedUser?._id as string);
    }, [selectedUser?._id?.$oid, index, fetchReports])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    lastFetchKeyRef.current = null;
    fetchReports(selectedUser?._id as string, true).finally(() => setRefreshing(false));
  }, [fetchReports, selectedUser?._id]);

  const onPressItem = useCallback((item: any) => {
    setPdfData(item);
    setShowPdfViewerModal(true);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <CCReportItem item={item} index={index} onPress={onPressItem} />
  ), [onPressItem]);

  const keyExtractor = useCallback((item: any, idx: number) => item?._id?.$oid ?? String(idx), []);

  const closePdfModal = useCallback(() => setShowPdfViewerModal(false), []);

  const screenTitle = useMemo(() => {
    const typeLabel = pdfData?.compatibility?.type
      ? `${pdfData.compatibility.type.charAt(0).toUpperCase()}${pdfData.compatibility.type.slice(1)}`
      : '';
    return `${typeLabel} ${i18n.t('compat.compatibilityReport')}`;
  }, [pdfData?.compatibility?.type]);

  const listEmptyComponent = useMemo(() => (
    <Text style={styles.emptyMessage}>{emptyMessage}</Text>
  ), [emptyMessage]);

  const loader = useMemo(() => (
    isLoading ? <Loader /> : null
  ), [isLoading]);

  const pdfModal = useMemo(() => (
    <PdfViewerModal
      closeModal={closePdfModal}
      visible={showPdfViewerModal}
      pdfUrl={pdfData?.pdf_report}
      title={screenTitle}
    />
  ), [showPdfViewerModal, pdfData?.pdf_report, closePdfModal, screenTitle]);

  return (
    <>
      {loader}
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scroll}
        ListEmptyComponent={listEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
      {pdfModal}
    </>
  );
}

export default React.memo(Downloads);

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
