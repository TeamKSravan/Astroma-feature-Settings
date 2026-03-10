import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { scale, verticalScale } from '../../utils/scale';
import { ModalClose } from '../../constants/svgpath';
import i18n from '../../translation/i18n';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';

type LanguageModalProps = {
  closeModal: () => void;
  visible: boolean;
  value: string;
  onLanguageSelect?: (language?: string) => void;
};

export default function LanguageModal(props: LanguageModalProps) {
  const { closeModal, visible, onLanguageSelect } = props;
  const navigation = useNavigation();
  const [languages, setLanguages] = useState<any[]>([
    { id: 1, label: i18n.t('language.english'), label2: 'English', icon: '🇺🇸', code: 'en' },
    { id: 2, label: i18n.t('language.hindi'), label2: 'हिंदी', icon: '🇮🇳', code: 'hi' },
  ]);
  const { setCurrentLanguage, currentLanguage } = useAuthStore();

  const handleLanguageSelect = async (language: any) => {
    setCurrentLanguage(language.code);
    i18n.locale = language.code;
    closeModal();
  }

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
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <ModalClose width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.orderTitle}>{i18n.t('language.language')}</Text>
          <Text style={styles.orderTitle2}>{i18n.t('language.selectLanguage')}</Text>
          {languages.map((language) => {
            const isSelected = language.code === currentLanguage;
            return (
              <TouchableOpacity
                key={language.id}
                style={[styles.planSummaryContainer, isSelected && styles.planSummaryContainerSelected]}
                onPress={() => handleLanguageSelect(language)}
              >
                <Text style={[styles.billLabel, isSelected && styles.billLabelSelected]}>{language.icon}  {language.label}</Text>
                <Text style={[styles.billValue, isSelected && styles.billValueSelected]}>{language.label2}</Text>
              </TouchableOpacity>
            );
          })}
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
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
  },

  ceneteredView: {
    alignItems: 'center',
    paddingHorizontal: scale(10),
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(20),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: verticalScale(5),
  },
  orderTitle2: {
    fontSize: scale(14),
    color: colors.white,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: verticalScale(5),
  },
  billLabel: {
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
    gap: scale(5),
    fontSize: scale(14),
    color: colors.white,
    fontFamily: fonts.regular,
    // textAlign: 'center',
  },
  billValue: {
    fontSize: scale(14),
    color: colors.lightGray,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  planSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    backgroundColor: colors.neutral700,
    height: scale(60),
    width: '100%',
    borderRadius: scale(8),
    paddingHorizontal: scale(15),
  },
  planSummaryContainerSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  billLabelSelected: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  billValueSelected: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});
