import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Country } from 'react-native-country-picker-modal';
import imagepath from '../../../constants/imagepath';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import i18n from '../../../translation/i18n';
import { colors } from '../../../constants/colors';
import { DigitSubscriberNumber, fonts } from '../../../constants/fonts';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import CountryCodePicker from '../../../components/CountryCodePicker';
import { ToastMessage } from '../../../components/ToastMessage';
import useValidation from '../../../hooks/useValidation';
import { useAuthStore } from '../../../store/useAuthStore';
import Loader from '../../../components/Loader';
import BaseView from '../../../utils/BaseView';
import { useWalletStore } from '../../../store/useWalletStore';
export default function LoginScreen(props: any) {
  const [phoneNumber, setPhoneNumber] = useState(__DEV__ ? '8980698248' : '');
  const [error, setError] = useState({});
  // :point_down: Set India (+91) as the default selected country
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    callingCode: ['91'],
    cca2: 'IN',
    currency: 'INR',
    flag: ':flag-in:',
    name: 'India',
    region: 'Asia',
    subregion: 'Southern Asia',
  } as Country);
  const { sendOTP, isLoading } = useAuthStore();
  const { getPlanDetails, } = useWalletStore();
  const { validate } = useValidation();

  // Sparkle twinkle animation refs (one per CSparkle)
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;
  const sparkle5 = useRef(new Animated.Value(0)).current;
  const sparkle6 = useRef(new Animated.Value(0)).current;
  const sparkle7 = useRef(new Animated.Value(0)).current;

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
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    console.log('Selected country:', country);
    console.log('Calling code:', country.callingCode[0]);
    console.log('Country code:', country.cca2);
  };
  const handleLogin = async () => {
    if (!selectedCountry) {
      setError({
        phone: i18n.t('login.selectCountry'),
      });
      // ToastMessage(i18n.t('login.selectCountry'));
      return;
    }
    if (phoneNumber.length === 0) {
      setError({
        phone: i18n.t('login.enterPhone'),
      });
      return;

    }
    let validationError = validate('phone', phoneNumber, {
      countryCode: selectedCountry.cca2,
      minLength: DigitSubscriberNumber.find(item => item.countryCode === `+${selectedCountry.callingCode[0]}`)?.totalNationalDigits,
      maxLength: 15,
    });
    if (validationError != '') {
      setError(prev => ({ ...prev, phone: validationError }));
      return;
    }
    // console.log(`code : ${selectedCountry.cca2} -> digits : ${DigitSubscriberNumber.find(item => item.countryCode === `+${selectedCountry.callingCode[0]}`)?.totalNationalDigits}`);
    // if (
    //   !validate('phone', phoneNumber, {
    //     countryCode: selectedCountry.cca2,
    //     minLength: DigitSubscriberNumber.find(item => item.countryCode === `+${selectedCountry.callingCode[0]}`)?.totalNationalDigits,
    //     maxLength: 15,
    //   })
    // ) {
    //   return;
    // }
    try {
      const fullPhoneNumber = `+${selectedCountry.callingCode[0]}${phoneNumber}`;
      const formdata = {
        country_code: `+${selectedCountry.callingCode[0]}`,
        phone: phoneNumber,
      }
      console.log('Full phone number:', formdata);
      const result = await sendOTP(formdata);
      if (result.success) {
        setError({})
        ToastMessage(i18n.t('login.otpSent'));
        setTimeout(() => {
          props.navigation.navigate('OtpScreen', {
            country_code: `+${selectedCountry.callingCode[0]}`,
            phone: phoneNumber,
            // phone: fullPhoneNumber,
          });
        }, 500);
      } else {
        ToastMessage(result.message || i18n.t('login.genericError'));
      }
    } catch (error: any) {
      ToastMessage(error?.message || i18n.t('login.genericError'));
      console.log('Login error:', error);
    }
  };
  return (
    <BaseView backgroundImage={imagepath.homeBg}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 60}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
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
            <Image source={imagepath.grouped2} style={styles.img} />
          </View>
          <View style={styles.mainView}>
            <Text style={styles.loginText}>{i18n.t('login.login')}</Text>
            <Text style={styles.emailText}>{i18n.t('login.phone')}</Text>
            <CustomTextInput
              placeholder={i18n.t('login.enterPhone')}
              value={phoneNumber}
              onChangeText={(txt) => setPhoneNumber(txt.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={15}
              leftComponent={
                <CountryCodePicker
                  onSelect={handleCountrySelect}
                  countryCode={selectedCountry?.cca2 || 'IN'}
                />
              }
              error={error?.phone || ''}
            />
          </View>
        </ScrollView>
        <CustomButton
          title={i18n.t('login.loginn')}
          style={styles.buttonStyle}
          onPress={handleLogin}
          disabled={phoneNumber.length == 0}
        />
      </KeyboardAvoidingView>
      {isLoading && <Loader />}
    </BaseView>
  );
}
const styles = StyleSheet.create({
  img: {
    alignSelf: 'center',
    marginTop: verticalScale(20),
  },
  mainView: {
    flex: 1,
    paddingHorizontal: scale(16),
    marginTop: verticalScale(20),
  },
  loginText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(30),
    marginBottom: verticalScale(10),
  },
  emailText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
    marginVertical: verticalScale(8),
  },
  buttonStyle: {
    marginHorizontal: scale(16),
    marginVertical: verticalScale(10),
  },
  container: {
    flex: 1,
  },
  smallImg: {
    position: 'absolute',
    width: 8,
    height: 8
  },
  mediumImg: {
    position: 'absolute',
    width: 12,
    height: 12
  },
});

// import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
// import React, { useState } from 'react';
// import { Country } from 'react-native-country-picker-modal';

// import imagepath from '../../../constants/imagepath';
// import { moderateScale, scale, verticalScale } from '../../../utils/scale';
// import i18n from '../../../translation/i18n';
// import { colors } from '../../../constants/colors';
// import { fonts } from '../../../constants/fonts';
// import CustomTextInput from '../../../components/CustomTextInput';
// import CustomButton from '../../../components/CustomButton';
// import CountryCodePicker from '../../../components/CountryCodePicker';
// import { ToastMessage } from '../../../components/ToastMessage';
// import useValidation from '../../../hooks/useValidation';
// import { useAuthStore } from '../../../store/useAuthStore';
// import Loader from '../../../components/Loader';
// import BaseView from '../../../utils/BaseView';

// export default function LoginScreen(props: any) {
//   const [phoneNumber, setPhoneNumber] = useState('');

//   // 👇 Set India (+91) as the default selected country
//   const [selectedCountry, setSelectedCountry] = useState<Country>({
//     callingCode: ['91'],
//     cca2: 'IN',
//     currency: 'INR',
//     flag: '🇮🇳',
//     name: 'India',
//     region: 'Asia',
//     subregion: 'Southern Asia',
//   } as Country);

//   const { sendOTP, isLoading } = useAuthStore();
//   const { validate } = useValidation();

//   const handleCountrySelect = (country: Country) => {
//     setSelectedCountry(country);
//     console.log('Selected country:', country);
//     console.log('Calling code:', country.callingCode[0]);
//     console.log('Country code:', country.cca2);
//   };

//   const handleLogin = async () => {
//     if (!selectedCountry) {
//       ToastMessage(i18n.t('login.selectCountry'));
//       return;
//     }

//     if (
//       !validate('phone', phoneNumber, {
//         countryCode: selectedCountry.cca2,
//         minLength: 7,
//         maxLength: 15,
//       })
//     ) {
//       return;
//     }

//     try {
//       const fullPhoneNumber = `+${selectedCountry.callingCode[0]}${phoneNumber}`;

//       console.log('Full phone number:', fullPhoneNumber);

//       const result = await sendOTP(fullPhoneNumber);
//       if (result.success) {
//         ToastMessage(i18n.t('login.otpSent'));
//         setTimeout(() => {
//           props.navigation.navigate('OtpScreen', {
//             phone: fullPhoneNumber,
//           });
//         }, 500);
//       } else {
//         ToastMessage(result.message || i18n.t('login.genericError'));
//       }
//     } catch (error: any) {
//       ToastMessage(error?.message || i18n.t('login.genericError'));
//       console.log('Login error:', error);
//     }
//   };

//   return (
//     <BaseView backgroundImage={imagepath.homeBg}>
//       <ScrollView scrollEnabled={false} showsVerticalScrollIndicator={false} c>
//         <Image source={imagepath.grouped2} style={styles.img} />
//         <View style={styles.mainView}>
//           <Text style={styles.loginText}>{i18n.t('login.login')}</Text>
//           <Text style={styles.emailText}>{i18n.t('login.phone')}</Text>

//           <CustomTextInput
//             placeholder={i18n.t('login.enterPhone')}
//             value={phoneNumber}
//             onChangeText={(txt) => setPhoneNumber(txt.replace(/[^0-9]/g, ''))}
//             keyboardType="phone-pad"
//             maxLength={15}
//             leftComponent={
//               <CountryCodePicker
//                 onSelect={handleCountrySelect}
//                 countryCode={selectedCountry?.cca2 || 'IN'}
//               />
//             }
//           />
//         </View>
//       </ScrollView>
//       <CustomButton
//         title={i18n.t('login.loginn')}
//         style={styles.buttonStyle}
//         onPress={handleLogin}
//       />

//       {isLoading && <Loader />}
//     </BaseView>
//   );
// }

// const styles = StyleSheet.create({
//   img: {
//     alignSelf: 'center',
//     marginTop: verticalScale(20),
//   },
//   mainView: {
//     flex: 1,
//     paddingHorizontal: scale(16),
//     marginTop: verticalScale(20),
//   },
//   loginText: {
//     color: colors.white,
//     fontFamily: fonts.bold,
//     fontSize: moderateScale(30),
//     marginBottom: verticalScale(10),
//   },
//   emailText: {
//     color: colors.white,
//     fontFamily: fonts.regular,
//     fontSize: moderateScale(12),
//     marginVertical: verticalScale(8),
//   },
//   buttonStyle: {
//     marginHorizontal: scale(16),
//     marginBottom: verticalScale(20),
//   },
// });
