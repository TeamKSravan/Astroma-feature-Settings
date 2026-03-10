import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, View, Text } from 'react-native';
import { colors } from '../constants/colors';
import { moderateScale } from '../utils/scale';
import { BellBorder } from '../constants/svgpath';
import { fonts } from '../constants/fonts';

interface NotificationBellProps {
  onPress: () => void;
  notificationCount: number;
  style?: ViewStyle;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  onPress,
  notificationCount,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[styles.container, style]}
    >
      {notificationCount > 0 && <View>
        <View style={styles.notificationCountContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" adjustsFontSizeToFit={true} style={styles.notificationCountText}>{notificationCount}</Text>
        </View>
        <BellBorder />
      </View> || <BellBorder />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(16),
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  notificationCountContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.red2,
    borderRadius: moderateScale(8),
    // minWidth: moderateScale(15),
    height: moderateScale(15),
    padding: moderateScale(2),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationCountText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(10),
  },
});

export default NotificationBell;
