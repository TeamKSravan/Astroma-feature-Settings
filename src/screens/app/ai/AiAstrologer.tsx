import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import imagepath from '../../../constants/imagepath';
import { AiAstrologerIcon, TwinStars } from '../../../constants/svgpath';
import i18n from '../../../translation/i18n';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import CommonHeader from '../../../components/CommonHeader';
import { colors } from '../../../constants/colors';
import { fonts, options } from '../../../constants/fonts';
import BaseView from '../../../utils/BaseView';
import { purchaseProduct } from '../../../services/iapService';
import OrderSummaryModal from '../../../components/modals/OrderSummary';

export default function AiAstrologer(props: any) {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const handleOptionPress = (option: any) => {
    setSelectedOption(option);
    // Navigate immediately when option is clicked
    if (option.id == 1) {
      props.navigation.navigate('ChatScreen', { selectedOption: option.id });
    } else {
      setShowOrderSummaryModal(true);
    }
  };

  const handleAddCoins = () => {
    console.log('selectedOption : ', selectedOption);
    const productId = selectedOption?.productID;
    if (typeof productId !== 'string' || !productId.trim()) {
      return;
    }
    console.log('productId : ', productId);
    purchaseProduct(productId);
  };

  return (
    <BaseView backgroundImage={imagepath.homeBg}>
      <CommonHeader
        LeftComponent={<View />}
        onWalletPress={() => props.navigation.navigate('Wallet', { showBack: true })}
        RightComponent={<View />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.mainView}>
          {/* <View style={styles.aiAstrologerIconContainer}>

          <AiAstrologerIcon />
          </View> */}
          <Image source={imagepath.grouped} style={styles.img} />
          <View style={styles.personalisedView}>
            <Text style={styles.personalisedText}>{i18n.t('ai.chat')}</Text>
            <TwinStars />
          </View>
          <Text style={styles.getText}>{i18n.t('ai.get')}</Text>
          <View style={styles.optionsContainer}>
            {options.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedOption === option.id && styles.optionButtonSelected,
                ]}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionCoins}>{option.coin} {option.coin == 1 ? 'Coin' : 'Coins'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <OrderSummaryModal packageData={selectedOption} closeModal={() => { setShowOrderSummaryModal(false) }} visible={showOrderSummaryModal} paynow={handleAddCoins} />
        </View>
      </ScrollView>
    </BaseView>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  img: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    marginTop: verticalScale(5),
    paddingHorizontal: scale(20),
  },
  personalisedView: {
    backgroundColor: colors.pink,
    height: verticalScale(30),
    width: '75%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    gap: scale(6),
    marginTop: verticalScale(10),
  },
  personalisedText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
  },
  getText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(30),
    paddingHorizontal: scale(16),
    marginTop: verticalScale(10),
  },
  optionsContainer: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
    gap: verticalScale(12),
  },
  optionButton: {
    backgroundColor: colors.dusty,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: verticalScale(25),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.dusty,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  optionLabel: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
  },
  optionCoins: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
  },
  scroll: {
    paddingBottom: 70,
  },
});
