import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Love } from '../../../../constants/svgpath';
import { colors } from '../../../../constants/colors';
import { fonts } from '../../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import imagepath from '../../../../constants/imagepath';
import BaseView from '../../../../utils/BaseView';
import { useAuthStore } from '../../../../store/useAuthStore';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../../../components/Loader';
import { useCompatibilityStore } from '../../../../store/useCompatibilityStore';
import PdfViewerModal from '../../../../components/modals/PdfViewerModal';
import CompatibilityProfiles from '../../../../components/CompatibilityProfiles';
import i18n from '../../../../translation/i18n';

interface DownloadedReportsProps {
  tabIndex?: number;
}

export default function DownoadedReports({ tabIndex }: DownloadedReportsProps) {
  const { isLoading } = useAuthStore();
  const [emptyMessage, setEmptyMessage] = useState<string>('');
  const { getCompatibilityReportList } = useCompatibilityStore();
  const [reports, setReports] = useState<Array<any>>([]);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfData, setPdfData] = useState<any>({});

  useEffect(() => {
    if (tabIndex === 1) {
      getCompatibilityReportList(true).then(response => {
        if (response.success) {
          console.log('compare Reports Response:', response.data);
          setReports(response.data);
        } else {
          console.log('Error:', response.message);
          setEmptyMessage('No Compare reports available yet');
          // setEmptyMessage(response.message as string);
        }
      });
    }
  }, [tabIndex]);


  const onPressItem = (item: any, index: number) => {
    console.log('Item pressed:', item, 'Index:', index);
    setPdfData(item);
    setShowPdfViewerModal(true);
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity style={styles.bgView} onPress={() => onPressItem(item, index)}>
      <Image source={imagepath.planetBg} style={styles.imbg} />
      <View style={styles.compatView}>
        <Love />
        <Text style={styles.compatText}>{`${item?.compatibility?.type} Compare`}</Text>
      </View>
      <CompatibilityProfiles profiles={item?.profiles || []} />
      {/* <Text style={styles.relationText}>{item?.profiles.map((profile: any) => profile.name).join(' | ')}</Text> */}
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
  const ScreenTitle = `${typeLabel} ${i18n.t('compat.compareReport')}`;
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
      <PdfViewerModal
        closeModal={() => { setShowPdfViewerModal(false) }}
        visible={showPdfViewerModal}
        pdfUrl={pdfData?.pdf_report}
        title={ScreenTitle}
      />
    </BaseView>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(20),
    marginVertical: verticalScale(6),
  },
  imbg: {
    alignSelf: 'flex-end',
    position: 'absolute',
    // height: '100%',
  },
  relationText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(12),
    marginVertical: verticalScale(6),
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
});
