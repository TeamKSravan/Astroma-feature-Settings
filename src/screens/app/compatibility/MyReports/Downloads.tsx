import i18n from '../../../../translation/i18n';
import Loader from '../../../../components/Loader';
import { fonts } from '../../../../constants/fonts';
import { colors } from '../../../../constants/colors';
import CCReportItem from '../../../../components/CCReportItem';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProfileStore } from '../../../../store/useProfileStore';
import { AppState, FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import PdfViewerModal from '../../../../components/modals/PdfViewerModal';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import { useCompatibilityStore } from '../../../../store/useCompatibilityStore';
import { useFocusEffect } from '@react-navigation/native';
import imagepath from '../../../../constants/imagepath';

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
  const isRefreshingOnResumeRef = useRef(false);
  const selectedUserId = (selectedUser as any)?._id?.$oid ?? '';

  const fetchReports = useCallback((userId: string, silent = false) => {
    if (!silent) setIsLoading(true);
    return getCompatibilityReportList(false).then(response => {
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : [];
        setReports(list);
        setEmptyMessage(
          list.length === 0 ? i18n.t('report.noCompatibilityReports') : '',
        );
      } else {
        setReports([]);
        setEmptyMessage(i18n.t('report.noCompatibilityReports'));
      }
    }).finally(() => {
      if (!silent) setIsLoading(false);
    });
  }, [getCompatibilityReportList]);

  useFocusEffect(
    useCallback(() => {
      if (index !== 2) return;
      const fetchKey = `${selectedUserId}_${index}`;
      if (lastFetchKeyRef.current === fetchKey) return;
      lastFetchKeyRef.current = fetchKey;
      fetchReports(selectedUserId);
    }, [selectedUserId, index, fetchReports])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active' || index !== 2 || isRefreshingOnResumeRef.current) {
        return;
      }
      isRefreshingOnResumeRef.current = true;
      fetchReports(selectedUserId, true).finally(() => {
        isRefreshingOnResumeRef.current = false;
      });
    });

    return () => {
      subscription.remove();
    };
  }, [index, fetchReports, selectedUserId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    lastFetchKeyRef.current = null;
    fetchReports(selectedUserId, true).finally(() => setRefreshing(false));
  }, [fetchReports, selectedUserId]);

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

  const listEmptyComponent = useMemo(() => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Image source={imagepath.DocumentIcon} style={styles.documentIcon} />
        <Text style={styles.emptyMessage}>
          {emptyMessage || i18n.t('report.noCompatibilityReports')}
        </Text>
      </View>
    );
  }, [emptyMessage, isLoading]);

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
        contentContainerStyle={[
          styles.scroll,
          reports.length === 0 && styles.scrollEmpty,
        ]}
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
  scrollEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    width: '90%',
    padding: scale(40),
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: scale(10),
    justifyContent: 'center',
    minHeight: verticalScale(100),
    backgroundColor: colors.primary,
  },
  documentIcon: {
    width: scale(40),
    height: scale(40),
    marginBottom: verticalScale(20),
  },
  emptyMessage: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
});
