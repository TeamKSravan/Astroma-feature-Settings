import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import OrderSummaryModal from '../../../components/modals/OrderSummary';
import i18n from '../../../translation/i18n';
import { purchaseProduct, purchaseSubscription } from '../../../services/iapService';
import { useWalletStore } from '../../../store/useWalletStore';
import Loader from '../../../components/Loader';
import { formatNumberWithCommas } from '../../../utils/methods';
import PlanComponent from './PlanComponent';

type PlanOption = {
  id: string;
  label: string;
  specialOffer: boolean;
  subscription: boolean;
  cost: number;
  coin: number;
  productID: string;
};

function getLocalizedPlanFeatureLines(planId: string): string[] {
  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';
  const replaceStorePlaceholder = (lines: string[]) => lines.map((line) => line.replace(/\{\{store\}\}/g, storeName));
  const localeKey = (i18n.locale || 'en').replace(/-.*/, '');
  const fromLocale = (i18n.translations as Record<string, { wallet?: { planFeatureSets?: Record<string, string[]> } }>)?.[localeKey]
    ?.wallet?.planFeatureSets?.[planId];
  if (Array.isArray(fromLocale) && fromLocale.length) {
    return replaceStorePlaceholder(fromLocale);
  }
  const fromEn = (i18n.translations as Record<string, { wallet?: { planFeatureSets?: Record<string, string[]> } }>)?.en?.wallet
    ?.planFeatureSets?.[planId];
  return Array.isArray(fromEn) ? replaceStorePlaceholder(fromEn) : [];
}

const coinSparkImageSize = { width: scale(50), height: scale(50) };
const KAV_BEHAVIOR = Platform.OS === 'ios' ? 'padding' as const : 'height' as const;
const KAV_OFFSET = Platform.OS === 'ios' ? 10 : 60;

function WalletScreen(props: any) {
  const { navigation, route } = props;

  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PlanOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { plans, availableCoins, getWalletDetails, getPlanDetails, currentSubscription } = useWalletStore();

  const coinSparkAnim = useRef(new Animated.Value(0)).current;
  const hasFetchedSubRef = useRef<string | null>(null);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(0),
      Animated.timing(coinSparkAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(coinSparkAnim, {
            toValue: 1.25,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(coinSparkAnim, {
            toValue: 0.75,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  const sparkleStyle = useMemo(() => {
    const opacity = coinSparkAnim.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.4, 1, 0.5],
    });
    const s = coinSparkAnim.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.7, 1, 1.2],
    });
    return { opacity, transform: [{ scale: s }] };
  }, [coinSparkAnim]);

  const subKey = currentSubscription?._id ?? '';

  useEffect(() => {
    if (hasFetchedSubRef.current === subKey) return;
    const fetch = async () => {
      setIsLoading(true);
      await Promise.all([
        getWalletDetails({ silent: true }),
        (!plans?.length ? getPlanDetails() : Promise.resolve()),
      ]);
      setIsLoading(false);
      hasFetchedSubRef.current = subKey;
    };
    fetch();
  }, [subKey, getWalletDetails, getPlanDetails, plans?.length]);

  const handleAddCoins = useCallback(() => {
    const productId = selectedPackage?.productID;
    console.log('productId', productId);
    if (typeof productId !== 'string' || !productId.trim()) return;
    if (Platform.OS === 'android') {
      if (!selectedPackage?.subscription) {
        purchaseProduct(productId);
      } else {
        purchaseSubscription(productId);
      }
    } else {
      console.log('Step 1 : purchaseSubscription', productId);
      purchaseSubscription(productId);
    }
  }, [selectedPackage]);

  const closeOrderSummary = useCallback(() => setShowOrderSummaryModal(false), []);
  const onCancelPlan = useCallback(() => setSelectedPackage(null), []);
  const onContinuePlan = useCallback(() => setShowOrderSummaryModal(true), []);

  const subscriptionPlans = useMemo(
    () => plans?.filter((o) => o.subscription) ?? [],
    [plans],
  );

  const featureLinesMap = useMemo(
    () => Object.fromEntries(subscriptionPlans.map(p => [p.id, getLocalizedPlanFeatureLines(p.id)])),
    [subscriptionPlans],
  );

  const loader = useMemo(() => (
    isLoading ? <Loader /> : null
  ), [isLoading]);

  const coinsDisplay = useMemo(() => (
    <View style={styles.coinsDisplayContainer}>
      <View style={styles.coinsRowContainer}>
        <View>
          <Animated.View style={[styles.coinSparkImage, sparkleStyle]}>
            <Image source={imagepath.coinSpark} style={coinSparkImageSize} />
          </Animated.View>
          <Image source={imagepath.Coins} style={styles.coinsImage} />
        </View>
        <Text style={styles.coinCountText}>{formatNumberWithCommas(availableCoins)}</Text>
      </View>
      <Text style={styles.availableCoinsText}>{i18n.t('wallet.availableCoins')}</Text>
    </View>
  ), [availableCoins, sparkleStyle]);

  const plansList = useMemo(() => (
    <View style={styles.plansSection}>
      <Text style={styles.plansSectionTitle}>{i18n.t('wallet.plans')}</Text>
      <View style={styles.optionsContainer}>
        {subscriptionPlans.map((option) => (
          <PlanComponent
            key={option.id}
            option={option}
            featureLines={featureLinesMap[option.id] ?? []}
            selectedPackage={selectedPackage}
            onPress={() => setSelectedPackage(option)}
            onCancel={onCancelPlan}
            onContinue={onContinuePlan}
          />
        ))}
      </View>
    </View>
  ), [subscriptionPlans, featureLinesMap, selectedPackage, onCancelPlan, onContinuePlan]);

  const orderModal = useMemo(() => (
    <OrderSummaryModal
      packageData={selectedPackage}
      closeModal={closeOrderSummary}
      visible={showOrderSummaryModal}
      navigation={navigation}
      paynow={handleAddCoins}
    />
  ), [selectedPackage, showOrderSummaryModal, closeOrderSummary, navigation, handleAddCoins]);

  return (
    <BaseView backgroundImage={imagepath.walletBg}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={KAV_BEHAVIOR}
        keyboardVerticalOffset={KAV_OFFSET}
      >
        <ScrollView
          bounces={false}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {loader}
          {coinsDisplay}
          {plansList}
          {orderModal}
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseView>
  );
}

export default React.memo(WalletScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: verticalScale(10),
    paddingHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: verticalScale(80),
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
    gap: verticalScale(10),
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
