import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { moderateScale, scale, verticalScale } from '../utils/scale';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode | null;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  disabled,
  icon = null,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[styles.container, style]}
      disabled={disabled}
    >
      <TouchableOpacity
        style={styles.innerButton}
        activeOpacity={1}
        disabled={disabled}
        onPress={onPress}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(50),
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: moderateScale(12),
    elevation: Platform.OS === 'ios' ? 8 : 0,
  },
  gradient: {
    borderRadius: moderateScale(50),
    padding: scale(2),
  },
  innerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF17',
    borderWidth: 0.5,
    borderRadius: moderateScale(50),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(32),
    marginBottom: 3,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(16),
  },
  iconContainer: {
    marginRight: scale(10),
  },
});

export default CustomButton;
