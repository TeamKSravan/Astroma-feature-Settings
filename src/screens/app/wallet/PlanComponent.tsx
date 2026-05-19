import React from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import imagepath from '../../../constants/imagepath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { Information } from '../../../constants/svgpath';
import i18n from '../../../translation/i18n';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '../../../utils/Constants';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PlanOption = {
  id: string;
  label: string;
  specialOffer: boolean;
  subscription: boolean;
  cost: number;
  coin: number;
};

type PlanComponentProps = {
  option: PlanOption;
  featureLines: string[];
  selectedPackage: PlanOption | null;
  forOneTime?: boolean;
  onPress: () => void;
  onCancel: () => void;
  onContinue: () => void;
};

const PlanComponent = ({
  option,
  featureLines,
  selectedPackage,
  forOneTime = false,
  onPress,
  onCancel,
  onContinue,
}: PlanComponentProps) => {
  const isSelected = selectedPackage?.id === option.id;

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  };

  return (
    <View>
      <TouchableOpacity
        key={option.id}
        style={[styles.planCard, isSelected && styles.planCardSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* TOP SECTION */}
        <View style={styles.planCardTopRow}>
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
              <Text style={styles.coinsBadgeText}>
                {i18n.t('wallet.coinsWithCount', { count: option.coin })}
              </Text>
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

              <Text style={styles.planPrice}>
                ${option.cost}
                {!forOneTime && `\n/ Month`}
              </Text>
            </View>
          )}
        </View>

        {/* EXPANDABLE SECTION */}
        {isSelected && (
          <View style={styles.planDetailsWrap}>
            {featureLines.map((item, index) => (
              <View key={`${option.id}-${index}`} style={styles.featureItemRow}>
                <Text style={styles.featureBullet}>{'\u2022'}</Text>
                <Text style={styles.planOfferText}>{item}</Text>
              </View>
            ))}

            {Platform.OS === 'ios' && <View style={styles.featureItemRow}>
              <Text style={styles.featureBullet}>{'\u2022'}</Text>
              <Text
                onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
                style={[styles.planOfferText, styles.linkText]}
              >
                {i18n.t('wallet.termsOfUse')}
              </Text>
            </View>}

            <View style={styles.featureItemRow}>
              <Text style={styles.featureBullet}>{'\u2022'}</Text>
              <Text
                onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                style={[styles.planOfferText, styles.linkText]}
              >
                {i18n.t('wallet.privacyPolicy')}
              </Text>
            </View>

            <View style={styles.planActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.planActionButton, styles.planCancelButton]}
                onPress={onCancel}
              >
                <Text style={[styles.planActionText, styles.planCancelText]}>
                  {i18n.t('coinSummary.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.planActionButton, styles.planContinueButton]}
                onPress={onContinue}
              >
                <Text style={[styles.planActionText, styles.planContinueText]}>
                  {i18n.t('coinSummary.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PlanComponent;

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: colors.dusty,
    borderRadius: scale(16),
    borderWidth: 1.5,
    borderColor: colors.menuBorder,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    minHeight: scale(72),
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },

  planCardSelected: {
    backgroundColor: colors.purple950,
    borderColor: colors.primary,
    borderWidth: 2,
  },

  planCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  offerSparkSmall: {
    width: 16,
    height: 16,
  },

  planPrice: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: moderateScale(20),
  },

  planDetailsWrap: {
    marginTop: verticalScale(14),
    borderTopWidth: 1,
    borderTopColor: colors.menuBorder,
    paddingTop: verticalScale(12),
    gap: verticalScale(8),
  },

  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
  },

  featureBullet: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },

  planOfferText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(12),
    flexShrink: 1,
  },

  linkText: {
    textDecorationLine: 'underline',
  },

  planActionRow: {
    flexDirection: 'row',
    gap: scale(10),
    marginTop: verticalScale(12),
  },

  planActionButton: {
    flex: 1,
    borderRadius: scale(10),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  planCancelButton: {
    backgroundColor: colors.menuBg,
    borderColor: colors.menuBorder,
  },

  planContinueButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  planActionText: {
    fontSize: moderateScale(13),
    fontFamily: fonts.semiBold,
  },

  planCancelText: {
    color: colors.white,
  },

  planContinueText: {
    color: colors.black,
  },
});
// import React, { useEffect, useRef } from 'react';
// import { Animated, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import imagepath from '../../../constants/imagepath';
// import { colors } from '../../../constants/colors';
// import { fonts } from '../../../constants/fonts';
// import { moderateScale, scale, verticalScale } from '../../../utils/scale';
// import { Information } from '../../../constants/svgpath';
// import i18n from '../../../translation/i18n';
// import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '../../../utils/Constants';

// type PlanOption = {
//     id: string;
//     label: string;
//     specialOffer: boolean;
//     subscription: boolean;
//     cost: number;
//     coin: number;
// };

// type PlanComponentProps = {
//     option: PlanOption;
//     featureLines: string[];
//     selectedPackage: PlanOption | null;
//     forOneTime?: boolean;
//     onPress: () => void;
//     onCancel: () => void;
//     onContinue: () => void;
// };

// const PlanComponent = ({ option, featureLines, selectedPackage, forOneTime = false, onPress, onCancel, onContinue }: PlanComponentProps) => {
//     const isSelected = selectedPackage?.id === option.id;
//     const collapsedHeight = verticalScale(80);
//     const expandedHeight = verticalScale(345);
//     const cardHeightAnim = useRef(
//         new Animated.Value(isSelected ? expandedHeight : collapsedHeight),
//     ).current;

//     useEffect(() => {
//         Animated.timing(cardHeightAnim, {
//             toValue: isSelected ? expandedHeight : collapsedHeight,
//             duration: 220,
//             useNativeDriver: false,
//         }).start();
//     }, [cardHeightAnim, collapsedHeight, expandedHeight, isSelected]);
//     console.log('option : ', option);
//     return (
//         <Animated.View style={{ height: cardHeightAnim }}>
//             <TouchableOpacity
//                 key={option.id}
//                 style={[
//                     styles.planCard,
//                     isSelected && styles.planCardSelected,
//                 ]}
//                 onPress={onPress}
//                 activeOpacity={0.9}
//             >
//                 <View style={styles.planCardTopRow}>
//                     <View style={styles.planCardLeft}>
//                         <View style={styles.planCardHeader}>
//                             <Text style={styles.optionTitle}>{option.label}</Text>
//                             {option.subscription && (
//                                 <View style={styles.infoIconWrap}>
//                                     <Information />
//                                 </View>
//                             )}
//                         </View>
//                         <View style={styles.coinsBadge}>
//                             <Text style={styles.coinsBadgeText}>
//                                 {i18n.t('wallet.coinsWithCount', { count: option.coin })}
//                             </Text>
//                         </View>
//                     </View>
//                     {option.cost != null && (
//                         <View style={styles.planCardRight}>
//                             {option.specialOffer && (
//                                 <View style={styles.specialOfferBadge}>
//                                     <Text style={styles.specialOfferBadgeText}>
//                                         {i18n.t('wallet.specialOffer')}
//                                     </Text>
//                                     <Image
//                                         source={imagepath.offerSpark}
//                                         style={styles.offerSparkSmall}
//                                     />
//                                 </View>
//                             )}
//                             <Text style={styles.planPrice}>${option.cost + (forOneTime ? '' : `\n/ Month`)}</Text>
//                         </View>
//                     )}
//                 </View>

//                 {isSelected && (
//                     <View style={styles.planDetailsWrap}>
//                         {featureLines.map((item, index) => (
//                             <View key={`${option.id}-${index}`} style={styles.featureItemRow}>
//                                 <Text style={styles.featureBullet}>{'\u2022'}</Text>
//                                 <Text style={styles.planOfferText}>{item}</Text>
//                             </View>
//                         ))}
//                         <View style={styles.featureItemRow}>
//                             <Text style={styles.featureBullet}>{'\u2022'}</Text>
//                             <Text onPress={() => Linking.openURL(TERMS_OF_USE_URL)} style={[styles.planOfferText, { textDecorationLine: 'underline' }]}>{i18n.t('wallet.termsOfUse')}</Text>
//                         </View>
//                         <View style={styles.featureItemRow}>
//                             <Text style={styles.featureBullet}>{'\u2022'}</Text>
//                             <Text onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} style={[styles.planOfferText, { textDecorationLine: 'underline' }]}>{i18n.t('wallet.privacyPolicy')}</Text>
//                         </View>
//                         <View style={styles.planActionRow}>
//                             <TouchableOpacity
//                                 activeOpacity={0.8}
//                                 style={[styles.planActionButton, styles.planCancelButton]}
//                                 onPress={onCancel}
//                             >
//                                 <Text style={[styles.planActionText, styles.planCancelText]}>
//                                     {i18n.t('coinSummary.cancel')}
//                                 </Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 activeOpacity={0.8}
//                                 style={[styles.planActionButton, styles.planContinueButton]}
//                                 onPress={onContinue}
//                             >
//                                 <Text style={[styles.planActionText, styles.planContinueText]}>
//                                     {i18n.t('coinSummary.continue')}
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 )}
//             </TouchableOpacity>
//         </Animated.View>
//     )
// };

// const styles = StyleSheet.create({
//     offerSparkSmall: {
//         width: 16,
//         height: 16,
//     },
//     planCard: {
//         height: '100%',
//         backgroundColor: colors.dusty,
//         borderRadius: scale(16),
//         borderWidth: 1.5,
//         borderColor: colors.menuBorder,
//         paddingVertical: verticalScale(14),
//         paddingHorizontal: scale(20),
//         minHeight: scale(72),
//         justifyContent: 'flex-start',
//         overflow: 'hidden',
//     },
//     planCardTopRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     planCardSelected: {
//         backgroundColor: colors.purple950,
//         borderColor: colors.primary,
//         borderWidth: 2,
//     },
//     planCardLeft: {
//         flex: 1,
//         gap: verticalScale(8),
//     },
//     planCardRight: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: scale(12),
//     },
//     planCardHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: scale(6),
//     },
//     optionTitle: {
//         color: colors.white,
//         fontFamily: fonts.bold,
//         fontSize: moderateScale(17),
//     },
//     infoIconWrap: {
//         opacity: 0.9,
//     },
//     coinsBadge: {
//         alignSelf: 'flex-start',
//         backgroundColor: colors.menuBg,
//         paddingHorizontal: scale(10),
//         paddingVertical: verticalScale(4),
//         borderRadius: scale(20),
//     },
//     coinsBadgeText: {
//         color: colors.lightYellow,
//         fontFamily: fonts.semiBold,
//         fontSize: moderateScale(12),
//     },
//     specialOfferBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: colors.primary,
//         gap: scale(6),
//         paddingHorizontal: scale(8),
//         paddingVertical: verticalScale(5),
//         borderRadius: scale(8),
//     },
//     specialOfferBadgeText: {
//         color: colors.black,
//         fontFamily: fonts.semiBold,
//         fontSize: moderateScale(11),
//     },
//     planPrice: {
//         color: colors.primary,
//         fontFamily: fonts.bold,
//         fontSize: moderateScale(20),
//     },
//     planDetailsWrap: {
//         marginTop: verticalScale(14),
//         borderTopWidth: 1,
//         borderTopColor: colors.menuBorder,
//         paddingTop: verticalScale(12),
//         gap: verticalScale(8),
//     },
//     planDetailRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     planDetailLabel: {
//         color: colors.lightYellow,
//         fontFamily: fonts.regular,
//         fontSize: moderateScale(12),
//     },
//     planDetailValue: {
//         color: colors.white,
//         fontFamily: fonts.semiBold,
//         fontSize: moderateScale(12),
//     },
//     planOfferText: {
//         color: colors.primary,
//         fontFamily: fonts.semiBold,
//         fontSize: moderateScale(12),
//         flexShrink: 1,
//     },
//     featureItemRow: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: scale(8),
//     },
//     featureBullet: {
//         color: colors.primary,
//         fontFamily: fonts.bold,
//         fontSize: moderateScale(14),
//         lineHeight: moderateScale(18),
//     },
//     planActionRow: {
//         flexDirection: 'row',
//         gap: scale(10),
//         marginTop: verticalScale(12),
//     },
//     planActionButton: {
//         flex: 1,
//         borderRadius: scale(10),
//         paddingVertical: verticalScale(10),
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderWidth: 1,
//     },
//     planCancelButton: {
//         backgroundColor: colors.menuBg,
//         borderColor: colors.menuBorder,
//     },
//     planContinueButton: {
//         backgroundColor: colors.primary,
//         borderColor: colors.primary,
//     },
//     planActionText: {
//         fontSize: moderateScale(13),
//         fontFamily: fonts.semiBold,
//     },
//     planCancelText: {
//         color: colors.white,
//     },
//     planContinueText: {
//         color: colors.black,
//     },
// });

// export default PlanComponent;