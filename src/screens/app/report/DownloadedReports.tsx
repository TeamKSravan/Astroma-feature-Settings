import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Linking,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Love, ReportDownload, ReportQuestion, ViewReport } from '../../../constants/svgpath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import imagepath from '../../../constants/imagepath';
import { useChatStore } from '../../../store/useChatStore';
import { useAuthStore } from '../../../store/useAuthStore';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import { ToastMessage } from '../../../components/ToastMessage';
import Loader from '../../../components/Loader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useProfileStore } from '../../../store/useProfileStore';
import PdfViewerModal from '../../../components/modals/PdfViewerModal';
import i18n from '../../../translation/i18n';
import CategorySign, { Type } from '../../../components/CategorySign';

interface DownloadedReportsProps {
  tabIndex?: number;
}

const GRADIENT_COLORS: string[] = [colors.neutral950, 'transparent'];
const GRADIENT_START = { x: 0, y: 0.8 };
const GRADIENT_END = { x: 0, y: 0 };

function DownoadedReports({ tabIndex }: DownloadedReportsProps) {

  const navigation = useNavigation();
  const { isLoading } = useAuthStore();
  const { getUserReports, getViewReport, getGenerateReport } = useChatStore();
  const [userReports, setUserReports] = useState<Array<any>>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>('');
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const { selectedUser } = useProfileStore();

  const lastFetchKeyRef = useRef<string>('');
  const userId = selectedUser?._id?.$oid ?? '';
  const fetchKey = `${userId}_${tabIndex}`;

  useFocusEffect(
    useCallback(() => {
      if (tabIndex !== 1) return;
      if (lastFetchKeyRef.current === fetchKey) return;
      getUserReports(userId).then(response => {
        if (response.success) {
          const reports = Array.isArray(response.data) ? response.data : [];
          setUserReports(reports);
          setEmptyMessage(
            reports.length === 0 ? i18n.t('report.noDownloadedReports') : '',
          );
          lastFetchKeyRef.current = fetchKey;
        } else {
          setEmptyMessage(i18n.t('report.noDownloadedReports'));
          setUserReports([]);
        }
      });
    }, [fetchKey, tabIndex, userId, getUserReports])
  );

  const handleViewReport = useCallback((item: any) => {
    getViewReport(item?._id?.$oid, userId)
      .then(response => {
        if (response.success) {
          navigation.navigate('ChatScreen', { chatType: 'viewReport', reportId: item?._id?.$oid, report: response.data });
        }
      });
  }, [userId, getViewReport, navigation]);

  const handleDownloadReport = useCallback((item: any) => {
    getGenerateReport(item?._id?.$oid, true, userId)
      .then(response => {
        if (response.success) {
          setPdfUrl(response.data as string || '');
          setShowPdfViewerModal(true);
        }
      });
  }, [userId, getGenerateReport]);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit storage permissions
    }

    try {
      // Android 13+ (API 33+) uses scoped storage - no permission needed for Downloads folder
      // Android 10-12 (API 29-32) also uses scoped storage - no permission needed
      // Android 9 and below (API 28-) needs WRITE_EXTERNAL_STORAGE
      if (Platform.Version < 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to download files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // For Android 10+ (API 29+), scoped storage is used and Downloads folder is accessible
      // without explicit permission when using DownloadDirectoryPath
      return true;
    } catch (err) {
      console.warn('Permission error:', err);
      // Even if permission request fails, try to proceed (might work with scoped storage)
      return Platform.Version >= 29;
    }
  };

  const downloadFile = async (url: string) => {
    if (!url || url.trim() === '') {
      ToastMessage(i18n.t('toast.invalidDownloadUrl'));
      return;
    }

    try {
      // Request permissions for Android
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          ToastMessage(i18n.t('toast.storagePermissionRequired'));
          return;
        }
      }

      // Extract file name from URL
      let fileName = url.split('/').pop() || `report_${Date.now()}.pdf`;

      // Clean filename - remove query parameters if any
      fileName = fileName.split('?')[0];

      // Sanitize filename - remove invalid characters
      const sanitizeFileName = (name: string): string => {
        // Remove invalid characters for filenames
        return name.replace(/[<>:"/\\|?*]/g, '_').trim();
      };

      const cleanFileName = sanitizeFileName(fileName);

      // Determine destination path based on platform - Always use Downloads folder
      let destPath: string;
      let downloadDirectory: string;

      if (Platform.OS === 'android') {
        // Use Downloads directory for Android
        downloadDirectory = RNFS.DownloadDirectoryPath;
        // Ensure the directory exists
        const dirExists = await RNFS.exists(downloadDirectory);
        if (!dirExists) {
          await RNFS.mkdir(downloadDirectory);
        }
        destPath = `${downloadDirectory}/${cleanFileName}`;
      } else {
        // For iOS, we'll use a temporary location first, then move to Downloads if possible
        // iOS doesn't allow direct access to Downloads folder via react-native-fs
        // So we use DocumentDirectoryPath which is accessible via Files app
        downloadDirectory = RNFS.DocumentDirectoryPath;
        destPath = `${downloadDirectory}/${cleanFileName}`;
      }

      // Check if file already exists and create unique filename if needed
      let finalDestPath = destPath;
      let counter = 1;
      while (await RNFS.exists(finalDestPath)) {
        const timestamp = Date.now();
        const nameParts = cleanFileName.split('.');
        const extension = nameParts.pop() || 'pdf';
        const name = nameParts.join('.');
        finalDestPath = Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${name}_${timestamp}.${extension}`
          : `${RNFS.DocumentDirectoryPath}/${name}_${timestamp}.${extension}`;
        counter++;
        // Prevent infinite loop
        if (counter > 100) {
          finalDestPath = Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}/${name}_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`
            : `${RNFS.DocumentDirectoryPath}/${name}_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
          break;
        }
      }

      console.log('Downloading from:', url);
      console.log('Saving to Downloads folder:', finalDestPath);
      console.log('Download directory path:', downloadDirectory);

      const downloadProgress = (data: any) => {
        if (data.contentLength > 0) {
          const percentage = Math.round((data.bytesWritten / data.contentLength) * 100);
          console.log(`Download progress: ${percentage}%`);
          // Only show toast for significant progress updates (every 25%)
          if (percentage % 25 === 0 || percentage === 100) {
            ToastMessage(i18n.t('toast.downloading', { percentage }));
          }
        }
      };

      const options = {
        fromUrl: url,
        toFile: finalDestPath,
        progress: downloadProgress,
        background: Platform.OS === 'android',
        progressDivider: 1,
      };
      const downloadResult = await RNFS.downloadFile(options).promise;

      if (downloadResult.statusCode === 200) {
        // Verify file was downloaded
        const fileExists = await RNFS.exists(finalDestPath);
        if (fileExists) {
          const fileSize = await RNFS.stat(finalDestPath);
          console.log('File downloaded successfully:', {
            path: finalDestPath,
            size: fileSize.size,
            downloadDirectory: downloadDirectory,
          });

          // Show success message with platform-specific info
          // if (Platform.OS === 'android') {
          //   ToastMessage(`File saved to Downloads folder\n${cleanFileName}`);
          // } else {
          //   ToastMessage(`File saved`);
          // }
          ToastMessage(i18n.t('toast.fileSaved'));
          return finalDestPath;
        } else {
          throw new Error('File download completed but file not found at destination');
        }
      } else {
        throw new Error(`Download failed with status code: ${downloadResult.statusCode}`);
      }
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMessage = error?.message || i18n.t('toast.downloadFailedFallback');
      ToastMessage(i18n.t('toast.downloadFailed', { message: errorMessage }));

      // Show more detailed error for debugging
      if (__DEV__) {
        Alert.alert('Download Error', errorMessage);
      }
    }
  };
  const closePdfModal = useCallback(() => setShowPdfViewerModal(false), []);
  const keyExtractor = useCallback((item: any) => item?._id?.$oid ?? item?._id, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.bgView}>
      <Image source={imagepath.planetBg} style={styles.imbg} />
      <View style={styles.compatView}>
        <CategorySign sign={item?.type} width={20} height={20} type={Type.color} />
        <Text style={styles.compatText}>{item?.name}</Text>
      </View>
      <Text style={styles.relationText}>{item?.sub_title}</Text>
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
        <TouchableOpacity style={styles.baseButton} onPress={() => handleViewReport(item)}>
          <ReportQuestion />
        </TouchableOpacity>
        <TouchableOpacity style={styles.baseButton} onPress={() => handleDownloadReport(item)}>
          <ReportDownload />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleViewReport, handleDownloadReport]);

  const loader = useMemo(() => (
    isLoading ? <Loader /> : null
  ), [isLoading]);

  const listEmptyComponent = useMemo(() => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyMessage}>
          {emptyMessage || i18n.t('report.noDownloadedReports')}
        </Text>
      </View>
    );
  }, [emptyMessage, isLoading]);

  const reportsList = useMemo(() => (
    <FlatList
      data={userReports}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      bounces={false}
      contentContainerStyle={[
        styles.scroll,
        userReports.length === 0 && styles.scrollEmpty,
      ]}
      ListEmptyComponent={listEmptyComponent}
    />
  ), [userReports, renderItem, keyExtractor, listEmptyComponent]);

  const pdfModal = useMemo(() => (
    <PdfViewerModal
      closeModal={closePdfModal}
      visible={showPdfViewerModal}
      pdfUrl={pdfUrl}
    />
  ), [showPdfViewerModal, pdfUrl, closePdfModal]);

  return (
    <View style={styles.container}>
      {loader}
      {reportsList}
      {pdfModal}
    </View>
  );
}

export default React.memo(DownoadedReports);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? verticalScale(25) : 0,
  },
  bgView: {
    backgroundColor: colors.neutral950,
    height: 170,
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
    // height: '100%',
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
    // backgroundColor: colors.red,
    alignSelf: 'flex-end',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(2),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(6),
    flexDirection: 'row',
    gap: scale(16),
    marginTop: verticalScale(10),
    position: 'absolute',
    bottom: 15
  },
  baseButton: {
    backgroundColor: '#FFFFFFCC',
    height: scale(22),
    width: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(6),
  },
  scroll: {
    paddingBottom: verticalScale(60),
    paddingHorizontal: scale(10),
  },
  scrollEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    minHeight: verticalScale(200),
  },
  emptyMessage: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
  descriptionGradient: {
    position: 'absolute',
    height: scale(50),
    width: '100%',
  },
  descriptionGradient2: {
    height: scale(50),
  },
});
