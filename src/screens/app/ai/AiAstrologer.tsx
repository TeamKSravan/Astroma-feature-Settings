import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useWalletStore } from '../../../store/useWalletStore';

export default function AiAstrologer(props: any) {
  const { availableCoins } = useWalletStore();
  const navigation = useNavigation();
  const lowerCount = 1;
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);

  useEffect(() => {
    if (availableCoins >= lowerCount) {
      navigation.navigate('ChatScreen' as never);
    }
  }, [availableCoins]);


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

    // Sparkle twinkle animation refs (one per CSparkle)
    const sparkle1 = useRef(new Animated.Value(0)).current;
    const sparkle2 = useRef(new Animated.Value(0)).current;
    const sparkle3 = useRef(new Animated.Value(0)).current;
    const sparkle4 = useRef(new Animated.Value(0)).current;
    const sparkle5 = useRef(new Animated.Value(0)).current;
    const sparkle6 = useRef(new Animated.Value(0)).current;
    const sparkle7 = useRef(new Animated.Value(0)).current;
    const sparkle8 = useRef(new Animated.Value(0)).current;
    const sparkle9 = useRef(new Animated.Value(0)).current;
    const sparkle10 = useRef(new Animated.Value(0)).current;
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
      createSparkleAnimation(sparkle1, 0);
      createSparkleAnimation(sparkle2, 300);
      createSparkleAnimation(sparkle3, 600);
      createSparkleAnimation(sparkle4, 900);
      createSparkleAnimation(sparkle5, 1200);
      createSparkleAnimation(sparkle6, 1500);
      createSparkleAnimation(sparkle7, 1800);
      createSparkleAnimation(sparkle8, 0);
      createSparkleAnimation(sparkle9, 600);
      createSparkleAnimation(sparkle10, 800);

    }, []);

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
          {/* <Image source={imagepath.grouped} resizeMode='contain' style={styles.img} /> */}
          <View style={[styles.img, { width: '100%' }]}>
            <Animated.View style={[styles.smallImg, { top: 110, left: 55 }, createElementStyle(sparkle1)]}>
              <Image source={imagepath.CSparkle} style={{ width: 8, height: 8 }} />
            </Animated.View>
            <Animated.View style={[styles.mediumImg, { top: 100, left: 65 }, createElementStyle(sparkle2)]}>
              <Image source={imagepath.CSparkle} style={{ width: 12, height: 12 }} />
            </Animated.View>
            <Animated.View style={[styles.smallImg, { bottom: 60, left: 100 }, createElementStyle(sparkle3)]}>
              <Image source={imagepath.CSparkle} style={{ width: 8, height: 8 }} />
            </Animated.View>
            <Animated.View style={[styles.smallImg, { bottom: 15, right: 180 }, createElementStyle(sparkle4)]}>
              <Image source={imagepath.CSparkle} style={{ width: 8, height: 8 }} />
            </Animated.View>
            <Animated.View style={[styles.mediumImg, { bottom: 80, right: 75 }, createElementStyle(sparkle5)]}>
              <Image source={imagepath.CSparkle} style={{ width: 12, height: 12 }} />
            </Animated.View>
            <Animated.View style={[styles.mediumImg, { top: 65, right: 100 }, createElementStyle(sparkle6)]}>
              <Image source={imagepath.CSparkle} style={{ width: 12, height: 12 }} />
            </Animated.View>
            <Animated.View style={[styles.mediumImg, { top: 110, right: 150 }, createElementStyle(sparkle7)]}>
              <Image source={imagepath.CSparkle} style={{ width: 12, height: 12 }} />
            </Animated.View>
            <Image source={imagepath.grouped2} resizeMode='contain' style={styles.img} />
          </View>
          <View style={styles.personalisedView}>
            <Text style={styles.personalisedText}>{i18n.t('ai.chat')}</Text>
            <Animated.View style={[styles.regularImg, {left: 0, top: 0}, createElementStyle(sparkle9)]}>
              <Image source={imagepath.CSparkle} style={{ width: 15, height: 15 }} />
            </Animated.View>
            <Animated.View style={[styles.regularImg, {left: -6, top: -5},  createElementStyle(sparkle10)]}>
              <Image source={imagepath.CSparkle} style={{ width: 15, height: 15 }} />
            </Animated.View>
            {/* <TwinStars /> */}
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
  smallImg: {
    position: 'absolute',
    width: 8,
    height: 8
  },
  regularImg: {
    width: 10,
    height: 10
  },
  mediumImg: {
    position: 'absolute',
    width: 12,
    height: 12
  },
});
