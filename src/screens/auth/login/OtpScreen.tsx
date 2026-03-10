import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import i18n from '../../../translation/i18n';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import CustomButton from '../../../components/CustomButton';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { ToastMessage } from '../../../components/ToastMessage';
import useValidation from '../../../hooks/useValidation';
import { useAuthStore } from '../../../store/useAuthStore';
import Loader from '../../../components/Loader';
import { useProfileStore } from '../../../store/useProfileStore';
import BackButton from '../../../components/BackButton';
import LanguageModal from '../../../components/modals/LanguageModal';
const TIMER_DURATION = 300; // 5 minutes in seconds

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function OtpScreen(props: any) {
  const [otp, setOtp] = useState('123456');
  const [showLanguageModal, setShowLanguageModal] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [timer, setTimer] = useState<number>(TIMER_DURATION);
  const { login, isLoading, userDetails, sendOTP, setIsGetBonus, currentLanguage } = useAuthStore();
  const { setSecondaryUserdata } = useProfileStore();
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

  const phone = props.route?.params?.phone || '';
  const country_code = props.route?.params?.country_code || '';

  const handleVerifyOtp = async () => {
    let validationError = validate('otp', otp);
    if (validationError != '') {
      ToastMessage(validationError);
      return;
    }

    try {
      const data = {
        phone: phone,
        country_code: country_code,
        otp: otp,
      };

      console.log('login', data);

      const result = await login(data);

      if (result.success) {
        ToastMessage('OTP verified successfully!');
        setSecondaryUserdata([]);
        setTimeout(() => {
          if (!result.isOnboarded) {
            props.navigation.replace('OnboardingScreen', { onBoardType: 'newUser' });
            setIsGetBonus(true);
          } else {
            // props.navigation.replace('AppNavigator');
            // props.navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'AppNavigator' }],
            // });
          }
        }, 500);
      } else {
        ToastMessage(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      console.log('login Error:', error);
      const errorMessage = error?.message || 'Invalid OTP. Please try again.';
      ToastMessage(errorMessage);
    }
  };


  const handleResendOtp = async () => {
    if (!phone) {
      ToastMessage('Phone number not found. Please go back and try again.');
      return;
    }
    try {
      const result = await sendOTP({
        country_code: country_code,
        phone: phone,
      });

      if (result.success) {
        ToastMessage('OTP sent successfully!');
        setOtp('');
      } else {
        ToastMessage(
          result.message || 'Failed to resend OTP. Please try again.',
        );
      }
    } catch (error: any) {
      console.error('Resend OTP Error:', error);

      const errorMessage =
        error?.message || 'Failed to resend OTP. Please try again.';

      ToastMessage(errorMessage);
    }
  };

  return (
    <BaseView backgroundImage={imagepath.homeBg}>
      <BackButton style={styles.backButton} />
      {/* <Image source={imagepath.grouped2} style={styles.img} /> */}
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
        <Text style={styles.loginText}>{i18n.t('login.auth')}</Text>
        <Text style={styles.emailText}>
          {i18n.t('login.code')}
          {phone ? ` sent to ${phone}` : ''}
        </Text>
        <OTPInputView
          style={styles.otpInput}
          pinCount={6}
          codeInputFieldStyle={styles.underlineStyleBase}
          selectionColor={colors.white}
          onCodeChanged={code => setOtp(code)}
          code={otp}
          keyboardType="number-pad"
          autoFocusOnLoad={false}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.timeLabel}>{formatTime(timer)}</Text>
          <View style={styles.resendView}>
            <Text style={styles.didntText}>{i18n.t('login.didnt')}</Text>
            <TouchableOpacity style={styles.touchView} onPress={handleResendOtp}>
              <Text style={styles.resendText}>{i18n.t('login.resend')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <CustomButton
        title={i18n.t('login.loginn')}
        style={styles.buttonStyle}
        onPress={handleVerifyOtp}
        disabled={otp.length == 0}
      />
      <LanguageModal 
        visible={showLanguageModal}
        value={currentLanguage}
        closeModal={() => setShowLanguageModal(false)} /> 
      {isLoading && <Loader />}
    </BaseView>
  );
}

const styles = StyleSheet.create({
  img: {
    alignSelf: 'center',
    marginTop: verticalScale(20),
  },
  backButton: {
    marginTop: verticalScale(50),
    marginLeft: scale(10),
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
    marginVertical: verticalScale(10),
  },
  buttonStyle: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(20),
  },
  underlineStyleBase: {
    height: scale(48),
    width: scale(48),
    borderWidth: 0.4,
    borderRadius: 10,
    borderColor: colors.primary,
    color: colors.white,
    fontFamily: fonts.regular,
    // marginEnd: 4,

    fontSize: moderateScale(20),
    backgroundColor: '#A8A8A81A',
  },
  otpInput: {
    marginTop: 14,
    flex: 1 / 6,
    marginBottom: 20,
  },
  resendText: {
    color: colors.primary,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
  },
  resendView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: verticalScale(4),
    alignItems: 'center',
  },
  didntText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
  },
  touchView: {
    marginTop: verticalScale(0),
  },
  timeLabel: {
    fontSize: scale(12),
    color: colors.white,
    fontFamily: fonts.regular,
    marginTop: verticalScale(5),
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
