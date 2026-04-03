import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { scale, verticalScale } from '../../utils/scale';
import CustomButton from '../CustomButton';
import i18n from '../../translation/i18n';
import { TaskDone } from '../../constants/svgpath';
import { ToastMessage } from '../ToastMessage';
import { useAuthStore } from '../../store/useAuthStore';

const OTP_LENGTH = 6;
const TIMER_DURATION = 120; // 2 minutes in seconds
const getInitialOtp = () => Array(OTP_LENGTH).fill('');

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type OTPVerificationProps = {
  closeModal: () => void;
  country_code?: string;
  phone?: string;
  visible: boolean;
};

export default function OTPVerification(props: OTPVerificationProps) {
  const { closeModal, visible, phone, country_code } = props;
  const { sendOTP, verifyOTP } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(getInitialOtp());
  const [timer, setTimer] = useState<number>(TIMER_DURATION);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  const resetOtp = useCallback(() => {
    setOtp(getInitialOtp());
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = useCallback((index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // Handle paste: fill multiple inputs
      const digits = numericValue.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus the last filled input or next empty one
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single digit input
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      
      // Auto-focus next input if digit entered
      if (numericValue && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  }, [otp]);

  const handleKeyPress = useCallback((index: number, key: string) => {
    // Handle backspace
    if (key === 'Backspace') {
      if (otp[index]) {
        // If current input has value, clear it
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // If current input is empty, move to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  }, [otp]);

  const resetTimer = useCallback(() => {
    setTimer(TIMER_DURATION);
  }, []);

  const resendOtp = useCallback(async () => {
    if (timerRef.current > 0) {
      return;
    }
    if (!phone) {
      ToastMessage(i18n.t('toast.phoneNumberNotFound'));
      return;
    }
    try {
      const result = await sendOTP({
        country_code: country_code || '',
        phone: phone,
      });

      if (result.success) {
        ToastMessage(i18n.t('toast.otpSentSuccess'));
        setOtp(getInitialOtp());
        inputRefs.current[0]?.focus();
        resetTimer();
      } else {
        ToastMessage(
          result.message || i18n.t('toast.failedToResendOtp'),
        );
      }
    } catch (error: any) {
      console.error('Resend OTP Error:', error);

      const errorMessage =
        error?.message || i18n.t('toast.failedToResendOtp');

      ToastMessage(errorMessage);
    }
  }, [phone, country_code, sendOTP, resetTimer]);


  const verifyOtpAction = useCallback(async () => {
    try {
      const data = {
        phone: phone || '',
        country_code: country_code || '',
        otp: otp.join(''),
      };

      console.log('verifyOTP', data);

      const result = await verifyOTP(data);

      if (result.success) {
        ToastMessage(i18n.t('toast.otpVerifiedSuccess'));
        closeModal();
      } else {
        ToastMessage(result.message || i18n.t('toast.invalidOtp'));
        closeModal();
      }
    } catch (error: any) {
      console.log('verifyOTP Error:', error);
      const errorMessage = error?.message || i18n.t('toast.invalidOtp');
      ToastMessage(errorMessage);
    }
  }, [phone, country_code, otp, closeModal]);

  const isOtpComplete = useMemo(() => {
    return otp.every(digit => digit !== '') && otp.join('').length === OTP_LENGTH;
  }, [otp]);

  const canResend = timer === 0;

  // Reset OTP and timer when modal opens
  useEffect(() => {
    if (visible) {
      resetOtp();
      resetTimer();
    } else {
      // Clear timer when modal closes
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [visible, resetOtp, resetTimer]);

  // Timer countdown effect
  useEffect(() => {
    if (!visible) {
      // Clear interval when modal is not visible
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Start timer when modal opens
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [visible]);

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={closeModal}
      backdropOpacity={0.8}
      isVisible={visible}
    >
      <View style={styles.modalView}>
        <View style={styles.centeredView}>
          <Text style={styles.orderTitle}>{i18n.t('otpVerification.title')}</Text>
          <Text style={styles.orderLabel}>
            {i18n.t('otpVerification.description')}
          </Text>
        </View>
        <View style={styles.otpContainer}>
          <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpInputWrapper}>
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(index, text)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                  placeholderTextColor={colors.lightGray}
                />
              </View>
            ))}
          </View>
          <Text style={styles.timeLabel}>{formatTime(timer)}</Text>
        </View>
        <View style={styles.resendRow}>
          <Text style={[styles.orderLabel, styles.resendPrefix]}>
            {i18n.t('otpVerification.didntReceive')}{' '}
          </Text>
          <Pressable
            onPress={resendOtp}
            disabled={!canResend}
            hitSlop={8}
          >
            <Text style={[styles.orderLabel2, !canResend && styles.orderLabel2Disabled]}>
              {i18n.t('otpVerification.resendCode')}
            </Text>
          </Pressable>
        </View>
        <CustomButton
          title={i18n.t('otpVerification.verifyOtp')}
          onPress={verifyOtpAction}
          style={styles.buttonStyle}
          disabled={!isOtpComplete}
          icon={isOtpComplete ? <TaskDone /> : null}
        />
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

  centeredView: {
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(30),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 20,
  },
  orderLabel: {
    fontSize: scale(12),
    color: colors.gray,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: verticalScale(5),
  },
  resendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  resendPrefix: {
    marginTop: 0,
  },
  orderLabel2: {
    fontSize: scale(12),
    color: colors.primary,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  orderLabel2Disabled: {
    color: colors.gray,
    opacity: 0.6,
  },
  buttonStyle: {
    marginTop: verticalScale(50),
  },
  otpInputWrapper: {
    width: scale(45),
    height: verticalScale(45),
    borderRadius: scale(12),
    borderWidth: 0.4,
    borderColor: colors.primary,
    backgroundColor: colors.lightBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: scale(20),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    padding: 0,
  },
  otpContainer: {
    paddingVertical: verticalScale(20),
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeLabel: {
    fontSize: scale(12),
    color: colors.white,
    fontFamily: fonts.regular,
    marginTop: verticalScale(5),
  },
});