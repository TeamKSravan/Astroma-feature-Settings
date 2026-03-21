import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import { CoinSumTitle, DownloadSuccessIcon, ModalClose } from '../../constants/svgpath';
import { useWalletStore } from '../../store/useWalletStore';
import i18n from '../../translation/i18n';
import BaseView from '../../utils/BaseView';
import imagepath from '../../constants/imagepath';

type DownloadSuccessProps = {
  title: string;
  cost: number;
  closeModal: () => void;
  visible: boolean;
};

export default function DownloadSuccess(props: DownloadSuccessProps) {
  const { closeModal, visible, title, cost = 0 } = props;
  const { availableCoins } = useWalletStore();

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={closeModal}
      backdropOpacity={0.8}
      isVisible={visible}
      style={{ margin: 0 }}
    >
      <BaseView backgroundImage={imagepath.homeBg}>
        <View style={styles.modalView}>
          <View style={styles.ceneteredView}>
            <DownloadSuccessIcon />
            <Text style={styles.orderTitle}>{i18n.t('downloadSuccess.title')}</Text>
            <Text style={styles.billLabel}>{i18n.t('downloadSuccess.description', { cost, availableCoins })}</Text>
          </View>
        </View>
      </BaseView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    // backgroundColor: colors.modalbg,
    width: '100%',
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
  },

  ceneteredView: {
    alignItems: 'center',
    marginTop: '50%',
    // marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(16),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    // marginTop: 20,
    marginBottom: verticalScale(5),
  },
  billLabel: {
    fontSize: scale(12),
    color: colors.white,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  billValue: {
    fontSize: scale(14),
    color: colors.white,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  noView: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(25),
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
  },
  yesView: {
    backgroundColor: colors.primary,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(25),
    flex: 1,
  },
  noText: {
    fontSize: moderateScale(16),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: 34,
  },
  yesText: {
    fontSize: moderateScale(16),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: 34,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  planSummaryContainer: {
    marginTop: 10,
    borderWidth: 1,
    backgroundColor: colors.neutral700,
    width: '100%',
    borderRadius: scale(16),
    alignItems: 'flex-start',
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(15),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: verticalScale(5),
  },
});
