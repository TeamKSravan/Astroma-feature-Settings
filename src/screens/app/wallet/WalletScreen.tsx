import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import CustomButton from '../../../components/CustomButton';
import { useAuthStore } from '../../../store/useAuthStore';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { Information } from '../../../constants/svgpath';
import OrderSummaryModal from '../../../components/modals/OrderSummary';
import i18n from '../../../translation/i18n';
import BackButton from '../../../components/BackButton';
import { purchaseProduct, purchaseSubscription } from '../../../services/iapService';
import { useWalletStore } from '../../../store/useWalletStore';
import Loader from '../../../components/Loader';

type PlanOption = {
  id: string;
  label: string;
  specialOffer: boolean;
  subscription: boolean;
  cost: number;
  coin: number;
  productID: string;
};

export default function WalletScreen(props: any) {
  const { navigation, route } = props;
  const { showBack = false } = route?.params || {};

  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PlanOption | null>(null);
  const [addCoinsAmount, setAddCoinsAmount] = useState('');
  const [options, setOptions] = useState<PlanOption[]>([]);
  const { plans, getPlanDetails, availableCoins, getWalletDetails, currentSubscription } = useWalletStore();
  const { isLoading } = useAuthStore();

  // Sparkle twinkle animation for coinSpark
  const coinSparkAnim = useRef(new Animated.Value(0)).current;
  const createSparkleAnimation = (animValue: Animated.Value, delay: number) => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.25,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.75,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  };
  const createElementStyle = (animValue: Animated.Value) => {
    const opacity = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.4, 1, 0.5],
    });
    const scale = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.7, 1, 1.2],
    });
    return { opacity, transform: [{ scale }] };
  };
  useEffect(() => {
    createSparkleAnimation(coinSparkAnim, 0);
  }, []);

  useEffect(() => {
    getAppWalletDetails();
    console.log('currentSubscription', currentSubscription);
  }, [currentSubscription]);

  const getAppWalletDetails = async () => {
    const res = await getWalletDetails();
    console.log('Response from getWalletDetails', res);
  }

  const handleAddCoins = () => {
    console.log('selectedPackage : ', selectedPackage);
    const productId = selectedPackage?.productID;
    if (typeof productId !== 'string' || !productId.trim()) {
      return;
    }
    if (Platform.OS === 'android') {
      if (!selectedPackage?.subscription) {
        purchaseProduct(productId);
      }
      else {
        purchaseSubscription(productId);
      }
    } else {
      purchaseSubscription(productId);
    }
  };

  return (
    <BaseView backgroundImage={imagepath.walletBg}>
      {/* <View style={styles.headerContainer}>
        {showBack && <BackButton />}
      </View> */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 60}
      >
        <ScrollView
            bounces={false}
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
          >
          {isLoading && <Loader />}
          <View style={styles.coinsDisplayContainer}>
            <View style={styles.coinsRowContainer}>
              <View>
                <Animated.View style={[styles.coinSparkImage, createElementStyle(coinSparkAnim)]}>
                  <Image
                    source={imagepath.coinSpark}
                    style={{ width: scale(50), height: scale(50) }}
                  />
                </Animated.View>
                <Image
                  source={imagepath.Coins}
                  style={styles.coinsImage}
                />
              </View>
              <Text style={styles.coinCountText}>{availableCoins}</Text>

            </View>
            <Text style={styles.availableCoinsText}>{i18n.t('wallet.availableCoins')}</Text>
          </View>
          {false && <View style={styles.specialOfferBanner}>
            <Text style={styles.specialofferText}>{i18n.t('wallet.specialOfferBanner')}</Text>
            <Image
              source={imagepath.offerSpark}
              style={styles.offerSparkSmall}
            />
          </View>}
          <View style={styles.plansSection}>
            <Text style={styles.plansSectionTitle}>{i18n.t('wallet.plans')}</Text>
            <View style={styles.optionsContainer}>
              {plans?.filter((o) => o.subscription).map((option) => (
                <TouchableOpacity
                  key={option.id}
                  disabled={plans.some(plan => plan.id === currentSubscription?.plan_details?._id )}
                  style={[
                    styles.planCard,
                    (currentSubscription?.plan_details?._id === option.id || selectedPackage?.id === option.id) && styles.planCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedPackage(option);
                    setShowOrderSummaryModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.planCardLeft}>
                    <View style={styles.planCardHeader}>
                      <Text style={styles.optionTitle}>{option.label}</Text>
                      {option.subscription && (
                        <View style={styles.infoIconWrap}>
                          <Information />
                        </View>
                      )}
                    </View>
                    <View style={styles.coinsBadge}>
                      <Text style={styles.coinsBadgeText}>{option.coin} Coins</Text>
                    </View>
                  </View>
                  {option.cost != null && (
                    <View style={styles.planCardRight}>
                      {option.specialOffer && (
                        <View style={styles.specialOfferBadge}>
                          <Text style={styles.specialOfferBadgeText}>
                            {i18n.t('wallet.specialOffer')}
                          </Text>
                          <Image
                            source={imagepath.offerSpark}
                            style={styles.offerSparkSmall}
                          />
                        </View>
                      )}
                      <Text style={styles.planPrice}>${option.cost}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <OrderSummaryModal packageData={selectedPackage} closeModal={() => { setShowOrderSummaryModal(false) }} visible={showOrderSummaryModal} navigation={navigation} paynow={handleAddCoins} />
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: verticalScale(10),
    paddingHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(20),
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    gap: scale(10),
  },
  helloView: {
    gap: verticalScale(4),
  },
  nameText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(16),
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: verticalScale(70),
  },
  logoutButtonText: {
    fontSize: moderateScale(16),
    fontFamily: fonts.semiBold,
  },
  coinsDisplayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(20),
    marginTop: scale(30),
  },
  coinsRowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
  },
  coinSparkImage: {
    width: scale(50),
    height: scale(50),
    position: 'absolute',
    top: -25,
    left: -40,
    zIndex: 1,
  },
  coinsImage: {
    width: scale(45),
    height: scale(45),
  },
  coinCountText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(40),
  },
  availableCoinsText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
    marginTop: scale(8),
  },
  specialOfferBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    gap: scale(10),
    marginHorizontal: moderateScale(55),
    paddingVertical: scale(7),
    marginVertical: scale(10),
    borderRadius: scale(4),
  },
  specialofferText: {
    color: colors.black,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
  },
  offerSparkSmall: {
    width: 16,
    height: 16,
  },
  plansSection: {
    marginTop: verticalScale(36),
    paddingHorizontal: scale(4),
  },
  plansSectionTitle: {
    color: colors.lightYellow,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(14),
    marginBottom: verticalScale(14),
    letterSpacing: 0.5,
  },
  optionsContainer: {
    gap: verticalScale(14),
  },
  planCard: {
    backgroundColor: colors.dusty,
    borderRadius: scale(16),
    borderWidth: 1.5,
    borderColor: colors.menuBorder,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    minHeight: scale(72),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  planCardSelected: {
    backgroundColor: colors.purple950,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  planCardLeft: {
    flex: 1,
    gap: verticalScale(8),
  },
  planCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  optionTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(17),
  },
  infoIconWrap: {
    opacity: 0.9,
  },
  coinsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.menuBg,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
  },
  coinsBadgeText: {
    color: colors.lightYellow,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(12),
  },
  specialOfferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    gap: scale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(5),
    borderRadius: scale(8),
  },
  specialOfferBadgeText: {
    color: colors.black,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(11),
  },
  planPrice: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: moderateScale(20),
  },
  addCoinsSeparator: {
    height: 0.2,
    backgroundColor: colors.primarylight,
    marginVertical: verticalScale(20),
  },
  addCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(21),
    gap: scale(10),
    borderWidth: 1,
    borderColor: colors.primarylight,
    backgroundColor: colors.modalbg,
    borderRadius: scale(15),
    paddingVertical: verticalScale(10),
  },
  addCoinsText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: scale(14),
  },
  addCoinsInput: {
    color: colors.white,
    width: scale(120),
    minHeight: verticalScale(30),
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(14),
    textAlign: 'center',
    backgroundColor: colors.menuBg,
    borderRadius: scale(5),
    paddingHorizontal: scale(10),
  },
});
