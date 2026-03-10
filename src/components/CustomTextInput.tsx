import React, { ReactNode } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  TextInputProps,
  ViewStyle,
  StyleProp,
  Text,
} from 'react-native';
import { colors } from '../constants/colors';
import i18n from '../translation/i18n';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';

interface CustomTextInputProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  inputStyle?: StyleProp<ViewStyle>;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  error?: string;
  editable?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  placeholder = i18n.t('name.name'),
  value,
  onChangeText,
  inputStyle,
  leftComponent,
  rightComponent,
  editable = true,
  error,
  ...props
}) => {
  return (
    <View>
      <View style={[styles.borderWrapper, inputStyle]}>
        {leftComponent && (
          <View style={styles.leftComponentWrapper}>{leftComponent}</View>
        )}

        <TextInput
          style={[
            styles.input,
            leftComponent && styles.inputWithLeft,
            rightComponent && styles.inputWithRight,
          ]}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={colors.lightGray}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />

        {rightComponent && (
          <View style={styles.rightComponentWrapper}>{rightComponent}</View>
        )}

      </View>
      {error && <Text style={styles.errorMessage}>{error}</Text>}
    </View>
  );
};

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

export default CustomTextInput;
