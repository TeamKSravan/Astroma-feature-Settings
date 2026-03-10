import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import { CoinSumTitle, ModalClose } from '../../constants/svgpath';
import { useWalletStore } from '../../store/useWalletStore';

type CoinSummaryProps = {
  title: string;
  cost: number;
  closeModal: () => void;
  visible: boolean;
  paynow?: () => void;
};

export default function CoinSummary(props: CoinSummaryProps) {
  const { closeModal, visible, paynow, title, cost=0 } = props;
  const { availableCoins } = useWalletStore();

  const handleYes = () => {
    closeModal();
    setTimeout(() => {
      paynow && paynow();
    }, 500);
  };

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={closeModal}
      backdropOpacity={0.8}
      isVisible={visible}
    >
      <View style={styles.modalView}>
        <View style={styles.ceneteredView}>
          <CoinSumTitle />
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <ModalClose width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.orderTitle}>{title}</Text>
          <Text style={styles.billLabel}>{`To download  Love compatibility report ${cost} coins will be deducted`}</Text>
          <View style={styles.planSummaryContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.billLabel}>{'Available Coins'}</Text>
              <Text style={styles.billValue}>{availableCoins}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.billLabel}>{'Remaining Coins'}</Text>
              <Text style={styles.billValue}>{availableCoins - cost}</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.noView} onPress={closeModal}>
            <Text style={styles.noText}>{'Cancel'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yesView} onPress={handleYes}>
            <Text style={styles.yesText}>{'Continue'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: colors.modalbg,
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
  },

  ceneteredView: {
    alignItems: 'center',
    paddingHorizontal: scale(10),
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(16),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 20,
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
