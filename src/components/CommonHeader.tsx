import React, { use } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';

import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { moderateScale, scale } from '../utils/scale';
import BackButton from './BackButton';
import CoinComponent from './CoinComponent';

interface CommonHeaderProps {
  LeftComponent?: React.ReactNode;
  RightComponent?: React.ReactNode;
  titleIcon?: React.ReactNode;
  title?: string;
  headerStyle?: ViewStyle;
  leftContainerStyle?: ViewStyle;
  rightContainerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  onBackPress?: () => void;
  onWalletPress?: () => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  LeftComponent,
  RightComponent,
  titleIcon,
  title,
  headerStyle,
  leftContainerStyle,
  rightContainerStyle,
  titleStyle,
  onBackPress = undefined,
  onWalletPress = undefined,
}) => {
  return (
    <View style={[styles.headerView, headerStyle]}>
      {LeftComponent && LeftComponent || <BackButton onBackPress={onBackPress} />}
      <View style={[styles.centeredContainer, leftContainerStyle]}>
        <View style={styles.starView}>
          {titleIcon && titleIcon} 
          {title && <Text style={[styles.headerText, titleStyle]}>{title}</Text>}
        </View>
      </View>
      {RightComponent && (
        <View style={[styles.rightContainer, rightContainerStyle]}>
          <TouchableOpacity onPress={onWalletPress}>
            <CoinComponent />
          </TouchableOpacity>
          {RightComponent}
        </View>
      )}
      {!RightComponent && <View style={styles.spacer} />}
    </View>
  );
};

export default CommonHeader;

const styles = StyleSheet.create({
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    alignItems: 'center',
    position: 'relative',
    minHeight: scale(44),
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  rightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: scale(34), // Match BackButton space for balance
  },
  headerText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(16),
  },
});
// <View style={[styles.headerView, headerStyle]}>
//   <View style={[styles.starView, leftContainerStyle]}>
//     {LeftComponent && LeftComponent}
//     <Text style={[styles.headerText, titleStyle]}>{title}</Text>
//   </View>

//   <View style={[styles.starView, rightContainerStyle]}>
//     <CoinComponent />
//     {RightComponent && RightComponent}
//   </View>
// </View>