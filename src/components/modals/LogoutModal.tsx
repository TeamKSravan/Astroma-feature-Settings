import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';
import i18n from '../../translation/i18n';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale } from '../../utils/scale';
import { Logout2 } from '../../constants/svgpath';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

type LogoutModalProps = {
  closeModal: () => void;
  visible: boolean;
};

export default function LogoutModal(props: LogoutModalProps) {
  const { closeModal, visible } = props;
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const handleYes = () => {
    closeModal();
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthNavigator', params: { screen: 'LoginScreen' } }],
      });
      logout();
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
          <Logout2 />
          </View>
          <Text style={styles.deleteTitle}>{i18n.t('logout.confirm')}</Text>
          <Text style={styles.deleteText}>{i18n.t('logout.arelog')}</Text>
          {/* <Text style={styles.areText}>{i18n.t('delete.you')}</Text> */}
        </View>
        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.noView} onPress={closeModal}>
            <Text style={styles.noText}>{i18n.t('logout.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yesView} onPress={handleYes}>
            <Text style={styles.yesText}>{i18n.t('logout.logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: colors.modalbg,
    height: 220,
    width: '100%',
    borderRadius: 16,
  },

  ceneteredView: {
    marginTop: 17,
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
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
    backgroundColor: colors.primary,
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
