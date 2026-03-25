import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextStyle, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import { UserAddIcon } from '../../constants/svgpath';

interface ListEmptyComponentProps {
  addUser?: () => void;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  description?: string;
  noButton?: boolean;
  addUserText?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function ListEmptyComponent({
  addUser,
  title,
  titleStyle,
  description,
  noButton = false,
  addUserText,
  containerStyle,
}: ListEmptyComponentProps) {
  return (
    <View style={[styles.modalView, containerStyle]}>
      <View style={styles.ceneteredView}>
        {!noButton && <View style={styles.logoutimg}>
          <UserAddIcon width={scale(50)} height={scale(50)} />
        </View>}
        {title && <Text style={[styles.deleteTitle, titleStyle]}>{title}</Text>}
        {description && <Text style={styles.deleteText}>{description}</Text>}
      </View>
      {!noButton && <View style={styles.buttonView}>
        <TouchableOpacity testID="add-user-button" style={styles.noView} onPress={() => addUser && addUser()}>
          <Text style={styles.noText}>{addUserText}</Text>
        </TouchableOpacity>
      </View>}
    </View>
  )
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: colors.modalbg,
    width: '95%',
    borderRadius: 16,
    paddingVertical: verticalScale(20),
    alignSelf: 'center',
  },

  ceneteredView: {
    marginTop: 17,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteTitle: {
    fontSize: scale(24),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  deleteText: {
    fontSize: scale(14),
    color: colors.lightGray,
    fontFamily: fonts.semiBold,
    lineHeight: 25,
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  noView: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(10),
    flex: 1,
    backgroundColor: colors.primary,
    borderWidth: 1,
  },
  noText: {
    fontSize: moderateScale(16),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: 34,
  },
  logoutimg: {
    height: 34,
    width: 34,
    margin: 10,
    marginBottom: 20,
  },
});
