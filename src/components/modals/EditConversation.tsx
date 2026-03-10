import React, { useState, useRef, useEffect, useCallback, useMemo, use } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Keyboard, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts, GOOGLE_API_KEY } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import CustomButton from '../CustomButton';
import i18n from '../../translation/i18n';
import CustomTextInput from '../CustomTextInput';
import CustomDropdown from '../CustomDropdown';
import { useChatStore } from '../../store/useChatStore';
import { ToastMessage } from '../ToastMessage';

type EditConversationProps = {
  title: string;
  id: string;
  closeModal: () => void;
  visible: boolean;
  reload?: () => void;
};


const ProfileInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  dropdown = false,
  data = []
}: {
  label: string,
  placeholder: string,
  value: string,
  onChangeText: (text: string) => void,
  dropdown?: boolean,
  data?: any[]
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.labelText}>{label}</Text>
      {dropdown ? <CustomDropdown
        data={data || []}
        placeholder={placeholder}
        value={value}
        isModal={true}
        onChangeText={onChangeText}
        inputStyle={{
          height: verticalScale(55),
        }}
      /> :
        <CustomTextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          inputStyle={{
            height: verticalScale(50),
          }}
        />
      }
    </View>
  )
}

export default function EditConversation(props: EditConversationProps) {
  const [title, setTitle] = useState(props.title || '');
  const [error, setError] = useState('');

  const { closeModal, visible } = props;
  const { editConversation } = useChatStore();
  
  useEffect(() => {
    const initialTitle = props.title || '';
    // Capitalize the first letter of the initial title
    const capitalizedTitle = initialTitle.length > 0 
      ? initialTitle.charAt(0).toUpperCase() + initialTitle.slice(1)
      : initialTitle;
    setTitle(capitalizedTitle);
    setError('');
    console.log('title : ', props.title);
  }, [props.title]);

  // Validate title
  const validateTitle = (titleValue: string): boolean => {
    const trimmedTitle = titleValue.trim();
    
    if (!trimmedTitle) {
      setError(i18n.t('editConversation.errorEmpty'));
      return false;
    }
    
    if (trimmedTitle.length < 2) {
      setError(i18n.t('editConversation.errorMinLength'));
      return false;
    }
    
    if (trimmedTitle.length > 100) {
      setError(i18n.t('editConversation.errorMaxLength'));
      return false;
    }
    
    if (trimmedTitle === props.title?.trim()) {
      setError(i18n.t('editConversation.errorSame'));
      return false;
    }
    
    setError('');
    return true;
  };

  const handleTitleChange = (text: string) => {
    // Capitalize the first letter
    const capitalizedText = text.length > 0 
      ? text.charAt(0).toUpperCase() + text.slice(1)
      : text;
    setTitle(capitalizedText);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const saveChanges = () => {
    // Validate before saving
    if (!validateTitle(title)) {
      ToastMessage(error || i18n.t('editConversation.errorInvalid'));
      return;
    }

    const trimmedTitle = title.trim();
    editConversation(props.id, trimmedTitle).then((result) => {
      if (result.success) {
        console.log('Conversation updated successfully');
        ToastMessage(i18n.t('editConversation.successMessage'));
        if (props.reload) {
          props.reload();
        }
        closeModal();
      } else {
        console.log('Failed to update conversation:', result.message);
        ToastMessage(result.message || i18n.t('editConversation.errorMessage'));
      }
    });
  }

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    const trimmedTitle = title.trim();
    return !trimmedTitle || 
           trimmedTitle.length < 2 || 
           trimmedTitle.length > 100 || 
           trimmedTitle === props.title?.trim();
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
        <View style={styles.centeredView}>
          <Text style={styles.orderTitle}>{i18n.t('editConversation.title')}</Text>
        </View>
        <ScrollView bounces={false} >
          <ProfileInput label={i18n.t('editConversation.label')} placeholder={i18n.t('editConversation.placeholder')} value={title} onChangeText={handleTitleChange} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
        <CustomButton title={i18n.t('editConversation.saveChanges')} onPress={saveChanges} style={styles.buttonStyle} disabled={isSaveDisabled()} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: colors.modalbg,
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
  },
  container: {
    flex: 1,
    marginTop: verticalScale(40),
  },
  inputContainer: {
    flex: 1,
    gap: verticalScale(10),
    // height: verticalScale(75),
    marginTop: verticalScale(5),
    // backgroundColor: colors.red,
  },
  labelText: {
    fontSize: moderateScale(12),
    color: colors.white,
    fontFamily: fonts.regular,
  },
  centeredView: {
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(14),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 20,
  },
  orderLabel: {
    fontSize: scale(12),
    color: colors.gray,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: verticalScale(5),
  },
  orderLabel2: {
    fontSize: scale(12),
    color: colors.primary,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  buttonStyle: {
    marginTop: verticalScale(20),
  },
  otpInputWrapper: {
    width: scale(45),
    height: verticalScale(45),
    borderRadius: scale(12),
    borderWidth: 0.4,
    borderColor: colors.primary,
    backgroundColor: colors.lightBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: scale(20),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    padding: 0,
  },
  otpContainer: {
    flex: 1,
    paddingVertical: verticalScale(20),
  },
  otpInputContainer: {
    flex: 1,
    gap: verticalScale(10),
    // backgroundColor: colors.red,
  },
  timeLabel: {
    fontSize: scale(12),
    color: colors.white,
    fontFamily: fonts.regular,
    marginTop: verticalScale(5),
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },

  dropdownText: {
    fontSize: 16,
    color: '#fff',
  },
  inputWrapper: {
    position: 'relative',
    height: verticalScale(80),
    // alignItems: 'center',
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyStateText: {
    fontSize: 14,
    color: '#bbb',
  },

  clearButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  clearButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // FIXED HEIGHT DROPDOWN - NO LAYOUT SHIFTS
  dropdownFixed: {
    backgroundColor: '#000',
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    height: 200, // FIXED HEIGHT - KEY TO PREVENT KEYBOARD DISMISS
    overflow: 'hidden',
  },
  errorText: {
    fontSize: moderateScale(12),
    color: colors.red || '#ff4444',
    fontFamily: fonts.regular,
    marginTop: verticalScale(5),
    marginLeft: scale(5),
  },
});
