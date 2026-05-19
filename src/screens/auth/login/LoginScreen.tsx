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
import SocialSigninButton from '../../../components/SocialSigninButton';
import CountryCodePicker from '../../../components/CountryCodePicker';
import { ToastMessage } from '../../../components/ToastMessage';
import useValidation from '../../../hooks/useValidation';
import { useAuthStore } from '../../../store/useAuthStore';
import Loader from '../../../components/Loader';
import BaseView from '../../../utils/BaseView';
import { useWalletStore } from '../../../store/useWalletStore';
import { requestUserPermission } from '../../../services/NotificationServices';
import { GoogleSignin, } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, AppleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleWebClientId } from '../../../constants/Keys';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { OnBoardType } from '../onboarding/OnboardingScreen';

GoogleSignin.configure({
  webClientId: GoogleWebClientId,
});

export default function LoginScreen(props: any) {
  const [phoneNumber, setPhoneNumber] = useState(__DEV__ ? '8980698248' : '');
  const [disableButton, setDisableButton] = useState(false);
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
  const { sendOTP, isLoading, CheckOnBoarding, SocialLogin } = useAuthStore();
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

  const handleGoogleLogin = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();
    console.log('signInResult =>', signInResult);
    var idToken = signInResult.data?.idToken;
    console.log('idToken =>', idToken);
    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = signInResult?.idToken;
    }
    if (!idToken) {
      throw new Error('No ID token found');
    }
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const firebaseUserCredential = await getAuth().signInWithCredential(googleCredential);
    console.log('firebaseUserCredential =>', firebaseUserCredential);
    const firebaseIdToken = await firebaseUserCredential.user.getIdToken()
    console.log('firebaseIdToken =>', firebaseIdToken);
    const body = {
      "id_token": firebaseIdToken,
      "provider": "google"
    };
    console.log('body =>', body);
    const result = await SocialLogin(body);
    if (result.success) {
      props.navigation.navigate('OnboardingScreen', { onBoardType: OnBoardType.socialLogin });
    } else {
      ToastMessage(result.message || i18n.t('login.loginFailed'));
    }
  };

  async function handleAppleLogin() {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
      // See: https://github.com/invertase/react-native-apple-authentication#faqs
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }

    // Create a Firebase credential from the response
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = AppleAuthProvider.credential(identityToken, nonce);
    console.log('appleCredential =>', appleCredential);
    const firebaseUserCredential = await signInWithCredential(getAuth(), appleCredential);
    const firebaseIdToken = await firebaseUserCredential.user.getIdToken();
    const body = {
      "id_token": firebaseIdToken,
      "provider": "apple"
    };
    console.log('body =>', body);
    const result = await SocialLogin(body);
    if (result.success) {
      props.navigation.navigate('OnboardingScreen', { onBoardType: OnBoardType.socialLogin });
    } else {
      ToastMessage(result.message || i18n.t('login.loginFailed'));
    }
  }


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
    void requestUserPermission().catch((e) =>
      console.warn('Notification permission:', e)
    );
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
    setDisableButton(true);
    scrollViewRef.current?.scrollToEnd({ animated: true });
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
      if(error && error?.phone !== i18n.t('login.enterPhone')){
        (scrollViewRef.current as any)?.scrollTo({
          y: currentOffset.current + 20,
            animated: true,
          });
        }
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

    try {

      const formdata = {
        country_code: `+${selectedCountry.callingCode[0]}`,
        phone: phoneNumber,
      }
      console.log('Full phone number:', formdata);
      const onBoardingResult = await CheckOnBoarding(formdata.country_code, formdata.phone);
      const result = await sendOTP(formdata);
      if (result.success) {
        setError({})
        ToastMessage(i18n.t('login.otpSent'));
        if (onBoardingResult.isOnboarded) {
          useAuthStore.setState({ isGetBonus: false });
        } else {
          useAuthStore.setState({ isGetBonus: true });
        }
        setTimeout(() => {
          props.navigation.navigate('OtpScreen', {
            country_code: `+${selectedCountry.callingCode[0]}`,
            phone: phoneNumber,
            isOnboarded: onBoardingResult.isOnboarded,
          });
        }, 500);
      }
    } catch (error: any) {
      // ToastMessage(error?.message || i18n.t('login.genericError'));
      console.log('Login error:', error);
    } finally {
      setDisableButton(false);
    }
  };
  const scrollViewRef = useRef<ScrollView>(null);
  const currentOffset = useRef(0);
  return (
    <BaseView backgroundImage={imagepath.homeBg}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 50}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            currentOffset.current =
              e.nativeEvent
                .contentOffset.y;
          }}
        >
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
          <View style={styles.mainView}>
            <Text style={styles.loginText}>{i18n.t('login.login')}</Text>
            <Text style={styles.emailText}>{i18n.t('login.phone')}</Text>
            <CustomTextInput
              placeholder={i18n.t('login.enterPhone')}
              value={phoneNumber}
              onChangeText={(txt) => {
                setPhoneNumber(txt.replace(/[^0-9]/g, ''));
                setError({});
              }}
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
          // disabled={phoneNumber.length == 0 || disableButton}
        />
        <View style={styles.orView}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>{i18n.t('login.or')}</Text>
          <View style={styles.orLine} />
        </View>
        <SocialSigninButton
          title={i18n.t('login.googleLogin')}
          style={styles.buttonStyle}
          icon={<Image source={imagepath.google} style={{ width: 25, height: 25 }} />}
          onPress={handleGoogleLogin}
        />
        {Platform.OS === 'ios' && <SocialSigninButton
          title={i18n.t('login.appleLogin')}
          style={styles.socialLoginButtonStyle}
          icon={<Image source={imagepath.apple} style={{ width: 25, height: 25 }} />}
          onPress={handleAppleLogin}
        />}
      </KeyboardAvoidingView>
      {isLoading && <Loader />}
    </BaseView>
  );
}
const styles = StyleSheet.create({
  img: {
    alignSelf: 'center',
    marginTop: Platform.OS === 'ios' ? verticalScale(0) : verticalScale(20),
  },
  mainView: {
    flex: 1,
    paddingHorizontal: scale(16),
    marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(20),
  },
  loginText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(30),
    marginBottom: verticalScale(10),
  },
  orView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(15),
    marginHorizontal: scale(20),
    gap: scale(10),
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary,
  },
  orText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  emailText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
    marginVertical: verticalScale(8),
  },
  buttonStyle: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(20),
  },
  socialLoginButtonStyle: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(10),
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