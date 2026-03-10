import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import i18n from '../../translation/i18n';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale } from '../../utils/scale';
import { DeleteRed, Logout2 } from '../../constants/svgpath';

type DeleteModalProps = {
  closeModal: () => void;
  title?: string;
  description?: string;
  cancelText?: string;
  deleteText?: string;
  visible: boolean;
  handleVerify?: () => void;
};

export default function DeleteModal({
  closeModal,
  visible,
  handleVerify,
  title = i18n.t('delete.title'),
  description = i18n.t('delete.arelog'),
  cancelText = i18n.t('delete.cancel'),
  deleteText = i18n.t('delete.delete'),
}: DeleteModalProps) {

  const handleYes = () => {
    closeModal();
    setTimeout(() => {
      handleVerify && handleVerify();
    }, 500);
  };

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={closeModal}
      backdropOpacity={0.8}
      isVisible={visible}
    >
      <View style={styles.modalView}>
        <View style={styles.ceneteredView}>
          <View style={styles.logoutimg}>
            <DeleteRed />
          </View>
          <Text style={styles.deleteTitle}>{title}</Text>
          <Text style={styles.deleteText}>{description}</Text>
        </View>
        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.noView} onPress={closeModal}>
            <Text style={styles.noText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yesView} onPress={handleYes}>
            <Text style={styles.yesText}>{deleteText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: colors.modalbg,
    width: '100%',
    borderRadius: 16,
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
    marginTop: 20,
  },
  deleteText: {
    fontSize: scale(14),
    color: colors.lightGray,
    fontFamily: fonts.semiBold,
    lineHeight: 25,
    marginBottom: 15,
    textAlign: 'center',
  },
  areText: {
    fontSize: moderateScale(12),
    color: colors.lightGray,
    fontFamily: fonts.medium,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
    marginBottom: 17,
  },
  noView: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(25),
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
  },
  yesView: {
    backgroundColor: colors.red600,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(25),
    flex: 1,
  },
  noText: {
    fontSize: moderateScale(16),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: 34,
  },
  yesText: {
    fontSize: moderateScale(16),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: 34,
  },
  logoutimg: {
    height: 34,
    width: 34,
    marginTop: 10
  },
});
