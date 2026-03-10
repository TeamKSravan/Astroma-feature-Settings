import React, { ReactNode, useState, useEffect } from 'react';
import { TextInput, StyleSheet, View, ViewStyle, StyleProp, TextInputProps, Text } from 'react-native';
import { colors } from '../constants/colors';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import i18n from '../translation/i18n';

const DATE_TEMPLATE = 'DD/MM/YYYY';

const formatWithSlashes = (digits: string) => {
  let result = '';
  if (digits.length > 0) result += digits.slice(0, 2);
  if (digits.length > 2) result += '/' + digits.slice(2, 4);
  if (digits.length > 4) result += '/' + digits.slice(4, 8);
  return result;
};

interface CustomDateInputProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  inputStyle?: StyleProp<ViewStyle>;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  editable?: boolean;
  error?: string;
}
const CustomDateInput: React.FC<CustomDateInputProps> = ({
  placeholder = i18n.t('profile.enterDate'),
  value,
  onChangeText,
  inputStyle,
  leftComponent,
  rightComponent,
  editable = true,
  error,
  ...props
}) => {
  // Extract digits from value prop (in case value is formatted or contains non-digits)
  const getDigitsFromValue = (val: string) => {
    if (!val) return '';
    return val.replace(/\D/g, '').slice(0, 8);
  };

  // Initialize digits from value prop
  const [digits, setDigits] = useState(getDigitsFromValue(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync digits when value prop changes externally
  useEffect(() => {
    const valueDigits = getDigitsFromValue(value);
    if (valueDigits !== digits) {
      setDigits(valueDigits);
    }
  }, [value]);

  const handleChange = (text: string) => {
    const onlyDigits = text.replace(/\D/g, '').slice(0, 8);
    setDigits(onlyDigits);
    // Call parent's onChangeText with digits only
    onChangeText(onlyDigits);
  };

  const displayValue =
    digits.length === 0 && !isFocused
      ? DATE_TEMPLATE
      : formatWithSlashes(digits);

  return (
    <View>
      <View style={[styles.borderWrapper, inputStyle]}>
        {leftComponent && (
          <View style={styles.leftComponentWrapper}>{leftComponent}</View>
        )}
        <TextInput
          value={displayValue}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            leftComponent ? styles.inputWithLeft : undefined,
            rightComponent ? styles.inputWithRight : undefined,
          ]}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={colors.lightGray}
          {...props}
        />
        {rightComponent && (
          <View style={styles.rightComponentWrapper}>{rightComponent}</View>
        )}
      </View>
      {error && <Text style={styles.errorMessage}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  borderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(12),
    borderWidth: 0.4,
    borderColor: colors.primary,
    backgroundColor: colors.lightBlack,
  },
  input: {
    flex: 1,
    paddingHorizontal: scale(20),
    height: verticalScale(50),
    fontSize: moderateScale(16),
    color: colors.white,
    fontFamily: fonts.regular,
  },
  inputWithLeft: {
    paddingLeft: scale(8),
  },
  inputWithRight: {
    paddingRight: scale(8),
  },
  leftComponentWrapper: {
    paddingLeft: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightComponentWrapper: {
    paddingRight: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    marginTop: 2,
    color: colors.red2,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
  }
});
export default CustomDateInput;