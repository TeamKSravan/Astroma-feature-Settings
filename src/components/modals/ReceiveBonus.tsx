import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Image } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale } from '../../utils/scale';
import { BonusSparkle } from '../../constants/svgpath';
import imagepath from '../../constants/imagepath';
import i18n from '../../translation/i18n';

type ReceiveBonusModalProps = {
  closeModal: () => void;
  visible: boolean;
  coinAmount?: number;
};

export default function ReceiveBonusModal(props: ReceiveBonusModalProps) {
  const { closeModal, visible, coinAmount = 50 } = props;

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={closeModal}
      backdropOpacity={0.8}
      isVisible={visible}
    >
      <View style={styles.modalWrapper}>
        <ImageBackground source={imagepath.BlackZodiacBg} style={styles.backgroundContainer}>
          <View style={styles.bonusHeaderContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.congratulationsText}>{i18n.t('report.congratulations')}</Text>
              <Text style={styles.bonusDescriptionText}>{i18n.t('report.welcomeBonus')}</Text>
            </View>
            <BonusSparkle />
          </View>

          <View style={styles.bonusCoinsContainer}>
            <View style={styles.coinImagesContainer}>
              <Image
                source={imagepath.coinSpark}
                style={styles.coinSparkleImage}
              />
              <Image
                source={imagepath.Coins}
                style={styles.coinMainImage}
              />
            </View>
            <Text style={styles.bonusAmountText}>{coinAmount}</Text>
          </View>

          <View style={styles.decorativeBottomBar} />
        </ImageBackground>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    backgroundColor: colors.modalbg,
    width: '100%',
    borderRadius: 16,
    borderWidth: 0.3,
    borderColor: colors.primary,
  },
  backgroundContainer: {
    height: scale(300),
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bonusHeaderContainer: {
    flexDirection: 'row',
    padding: scale(5),
    marginTop: scale(10),
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: scale(15),
  },
  congratulationsText: {
    fontSize: scale(30),
    color: colors.primary,
    fontFamily: fonts.bold,
    marginTop: scale(10),
  },
  bonusDescriptionText: {
    fontSize: scale(13),
    color: colors.primary,
    fontFamily: fonts.regular,
    marginRight: scale(12),
    textAlign: 'center',
  },
  bonusCoinsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    marginTop: scale(40),
  },
  coinImagesContainer: {
    marginRight: scale(15),
  },
  coinSparkleImage: {
    width: scale(50),
    height: scale(50),
    position: 'absolute',
    top: -scale(25),
    left: -scale(40),
    zIndex: 1,
  },
  coinMainImage: {
    width: scale(50),
    height: scale(50),
  },
  bonusAmountText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(40),
  },
  decorativeBottomBar: {
    width: '80%',
    height: scale(40),
    backgroundColor: colors.primary,
    borderRadius: scale(18),
    position: 'absolute',
    bottom: -scale(32),
  },
});
