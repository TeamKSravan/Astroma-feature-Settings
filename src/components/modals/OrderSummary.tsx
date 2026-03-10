import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';
import i18n from '../../translation/i18n';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import { ModalClose } from '../../constants/svgpath';
import CustomButton from '../CustomButton';
import {
  getAvailableSubscriptions,
  purchaseSubscription,
  resetModalFlag,
  restorePurchases,
} from '../../services/iapService';

type OrderSummaryModalProps = {
  packageData: any;
  closeModal: () => void;
  visible: boolean;
  navigation?: any; // replace with proper type if using navigation
  paynow?: () => void;
};

export default function OrderSummaryModal(props: OrderSummaryModalProps) {
  const { closeModal, visible, navigation, paynow } = props;
  const [subscriptions, setSubscriptions] = useState([]);
  console.log('package data : ', props.packageData);
  const { label, specialOffer, subscription, cost } = props?.packageData || {};

  const bill = subscription ? [{
    title1: i18n.t('order.subscription'),
    value1: i18n.t('order.monthly'),
    title2: i18n.t('order.subscriptionCost'),
    value2: cost ? `$${cost}` : '$0.00',
  }]
    : [{
      title2: label,
      value2: cost ? `$${cost}` : '$0.00',
    }]


  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        console.log('Loading available subscriptions...');

        // IAP is already initialized globally, just fetch products
        const availableSubscriptions = await getAvailableSubscriptions();
        console.log('Available subscriptions:', availableSubscriptions);

        if (availableSubscriptions && availableSubscriptions.length > 0) {
          console.log('availableSubscriptions => ', availableSubscriptions);
          // const sortedSubscriptions = availableSubscriptions.sort((a, b) => {
          //   const aIndex = getPlanTierIndex(a?.productId);
          //   const bIndex = getPlanTierIndex(b?.productId);
          //   return aIndex - bIndex;
          // });
          // setSubscriptions(sortedSubscriptions);
        }
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
      }
    };

    loadSubscriptions();
  }, []);
  const handleYes = () => {
    closeModal();
    setTimeout(() => {
      paynow && paynow();
    }, 500);
  };

  type BillItemProps = {
    title1: string;
    value1: string;
    title2: string;
    value2: string;
    index?: number;
  };

  const BillRenderItem: React.FC<BillItemProps> = ({ title1, value1, title2, value2 }) => (
    <View style={styles.billItemContainer}>
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>{title1}</Text>
        <Text style={styles.billValue}>{value1}</Text>
      </View>
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>{title2}</Text>
        <Text style={styles.billValue}>{value2}</Text>
      </View>
      <View style={styles.billDivider} />
    </View>
  );
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
          <Text style={styles.orderTitle}>{i18n.t('order.title')}</Text>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <ModalClose width={24} height={24} />
          </TouchableOpacity>
          <View style={styles.planSummaryContainer}>
            <Text style={styles.orderLabel}>{subscription ? i18n.t('order.subtitle') : i18n.t('order.purchaseSummary')}</Text>
            {bill.map((item, index) => <BillRenderItem key={index} {...item} index={index} />)}
            <View style={styles.totalRow}>
              <Text style={styles.billLabel}>{i18n.t('order.total')}</Text>
              <Text style={styles.billValue}>{cost ? `$${cost}` : '$0.00'}</Text>
            </View>
          </View>
        </View>
        <CustomButton title={i18n.t('order.paynow')} onPress={handleYes} />

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
    alignItems: 'flex-start',
    paddingHorizontal: scale(10),
    marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(16),
    color: colors.primary,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 20,
  },
  orderLabel: {
    fontSize: scale(16),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
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
  orderText: {
    fontSize: scale(14),
    color: colors.lightGray,
    fontFamily: fonts.semiBold,
    // lineHeight: 25,
    textAlign: 'center',
  },
  areText: {
    fontSize: moderateScale(12),
    color: colors.lightGray,
    fontFamily: fonts.medium,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
    marginBottom: 17,
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
  logoutimg: {
    height: 34,
    width: 34,
    marginTop: 10
  },
  billItemContainer: {
    marginTop: 20,
    width: '100%',
    gap: verticalScale(5),
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  billDivider: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginTop: verticalScale(5),
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  planSummaryContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
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
    marginVertical: verticalScale(5),
  },
});
