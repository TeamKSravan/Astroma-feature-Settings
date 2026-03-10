import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';

import { Send } from '../constants/svgpath';
import { moderateScale, scale, verticalScale } from '../utils/scale';

interface GradientTextInputProps extends TextInputProps {
  containerStyle?: object;
  inputStyle?: object;
  gradientColors?: string[];
  onSendPress?: () => void;
  showSendIcon?: boolean;
  disabled?: boolean;
}

const GradientTextInput: React.FC<GradientTextInputProps> = ({
  containerStyle,
  inputStyle,
  gradientColors = [colors.light, colors.black],
  onSendPress,
  disabled = false,
  showSendIcon = true,
  value,
  onChangeText,
  placeholder,
  ...rest
}) => {
  console.log('disabled', disabled);
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 3, y: 1 }}
      end={{ x: 0, y: 1 }}
      style={[styles.gradientContainer, containerStyle]}
    >
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={colors.white}
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
        />
        {showSendIcon && (
          <TouchableOpacity onPress={disabled ? undefined : onSendPress} style={styles.sendButton} disabled={disabled}>
            <Send />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: scale(10),
    marginHorizontal: scale(20),
    borderColor: colors.primary,
    marginBottom: verticalScale(10),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    height: verticalScale(54),
    borderWidth: 0.6,
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
  },
  sendButton: {
    marginLeft: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GradientTextInput;
