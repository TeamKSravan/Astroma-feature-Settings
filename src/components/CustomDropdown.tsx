import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { colors } from '../constants/colors';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import { DropdownArrow } from '../constants/svgpath';
import i18n from '../translation/i18n';

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  placeholder?: string;
  value: string;
  isModal?: boolean;
  onChangeText: (text: string) => void;
  inputStyle?: StyleProp<ViewStyle>;
  data: DropdownItem[];
  onBlur?: () => void;
  onFocus?: () => void;
  editable?: boolean;
  closeTrigger?: any; // When this value changes, the dropdown will close
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  placeholder = i18n.t('name.name'),
  value,
  isModal = false,
  onChangeText,
  inputStyle,
  editable = true,
  data,
  onBlur,
  onFocus,
  closeTrigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<View>(null);
  
  // Close dropdown when closeTrigger changes
  React.useEffect(() => {
    setIsOpen(prevIsOpen => {
      if (prevIsOpen) {
        onBlur?.();
        return false;
      }
      return prevIsOpen;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeTrigger]); // Only depend on closeTrigger - onBlur is stable or doesn't need to be in deps

  // Find selected item label
  const selectedLabel = useMemo(() => {
    const selectedItem = data.find(item => item.value === value);
    return selectedItem?.label || '';
  }, [data, value]);

  const handleToggle = useCallback(() => {
    if (!editable) return;
    const newState = !isOpen;

    if (newState && wrapperRef.current) {
      // Measure position when opening
      wrapperRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height,
          left: x,
          width: width,
        });
      });
    }

    setIsOpen(newState);
    if (newState) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  }, [editable, isOpen, onFocus, onBlur]);

  const handleSelectItem = useCallback((item: DropdownItem) => {
    onChangeText(item.value);
    setIsOpen(false);
    onBlur?.();
  }, [onChangeText, onBlur]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onBlur?.();
  }, [onBlur]);

  const displayText = selectedLabel || placeholder;
  const textStyle = selectedLabel ? styles.selectedText : styles.placeholderText;

  return (
    <View ref={wrapperRef} style={[styles.wrapper, inputStyle]}>
      <View style={[styles.borderWrapper, inputStyle]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.triggerButton}
          onPress={handleToggle}
          disabled={!editable}
        >
          <Text style={textStyle} numberOfLines={1}>
            {displayText}
          </Text>
          <DropdownArrow
            width={scale(10)}
            height={scale(10)}
            color={colors.white}
            style={[
              styles.arrowIcon,
              { transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }
            ]}
          />
        </TouchableOpacity>
      </View>
      {isOpen && !isModal && (
        <>
          <Pressable style={styles.backdrop} onPress={handleClose} />
          <View style={styles.dropdownContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {data.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.dropdownItem,
                    value === item.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleSelectItem(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      value === item.value && styles.dropdownItemTextSelected
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
      {isOpen && isModal && (
        <Modal
          visible={isOpen}
          transparent
          animationType="none"
          onRequestClose={handleClose}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleClose}>
            <View
              style={[
                styles.dropdownContainer,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width || '100%',
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {data.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      value === item.value && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleSelectItem(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        value === item.value && styles.dropdownItemTextSelected
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    zIndex: 1,
  },
  borderWrapper: {
    width: '100%',
    borderRadius: scale(12),
    borderWidth: 0.4,
    borderColor: colors.primary,
    backgroundColor: colors.lightBlack,
    minHeight: verticalScale(50),
    zIndex: 2,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    minHeight: verticalScale(50),
  },
  placeholderText: {
    flex: 1,
    fontSize: moderateScale(16),
    color: colors.lightGray,
    fontFamily: fonts.regular,
  },
  selectedText: {
    flex: 1,
    fontSize: moderateScale(16),
    color: colors.white,
    fontFamily: fonts.regular,
  },
  arrowIcon: {
    marginLeft: scale(10),
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    top: verticalScale(55),
    width: '100%',
  },
  scrollView: {
    maxHeight: verticalScale(120),
    borderRadius: scale(12),
    borderWidth: 0.4,
    borderColor: colors.primary,
    backgroundColor: colors.modalbg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 0.5,
    borderBottomColor: colors.primary + '20',
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary + '15',
  },
  dropdownItemText: {
    fontSize: moderateScale(16),
    color: colors.white,
    fontFamily: fonts.regular,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontFamily: fonts.regular,
  },
});

export default CustomDropdown;
