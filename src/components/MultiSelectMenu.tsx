import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, TextStyle, ViewStyle, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../constants/colors';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import { Checked, Cross, Reset, Unchecked } from '../constants/svgpath';
import i18n from '../translation/i18n';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectMenuProps {
  options: Option[];
  triggerComponent: React.ReactNode;
  onSelect: (selectedValues: string[]) => void;
  selectedValues?: string[];
  menuOptionsContainerStyle?: StyleProp<ViewStyle>;
  menuOptionTextStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  showClearAll?: boolean;
  clearAllLabel?: string;
}

const MultiSelectMenu = ({
  options,
  triggerComponent,
  onSelect,
  selectedValues = [],
  menuOptionsContainerStyle,
  menuOptionTextStyle,
  style,
  showClearAll = false,
  clearAllLabel = i18n.t('filters.reset'),
}: MultiSelectMenuProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedValues);

  useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? [] // deselect if tapping the same option
      : [value]; // single selection: only one option at a time
    setSelected(newSelected);
    onSelect(newSelected);
  };

  const handleClearAll = () => {
    setSelected([]);
    onSelect([]);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const Checkbox = ({ isSelected }: { isSelected: boolean }) => (
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <View style={styles.checkboxInner} />}
    </View>
  );

  // Calculate container height based on option count
  const calculatedHeight = useMemo(() => {
    // Calculate actual item height based on styles
    const itemPaddingTop = verticalScale(12);
    const itemPaddingBottom = verticalScale(12);
    const itemTextHeight = moderateScale(16) * 1.4; // font size * line height multiplier
    const itemHeight = itemPaddingTop + itemPaddingBottom + itemTextHeight;
    
    // Container padding
    const containerPaddingTop = scale(10);
    const containerPaddingBottom = scale(10);
    const containerPadding = containerPaddingTop + containerPaddingBottom;
    
    // Calculate heights
    const minHeight = itemHeight * 2 + containerPadding; // Minimum 2 items
    const maxHeight = itemHeight * 6 + containerPadding; // Maximum 6 items before scroll
    const totalContentHeight = itemHeight * options.length + containerPadding;
    
    // Clamp between min and max
    const finalHeight = Math.min(Math.max(totalContentHeight, minHeight), maxHeight);
    return finalHeight;
  }, [options.length]);

  return (
    <View style={style}>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        {triggerComponent}
      </TouchableOpacity>
      <Modal
        isVisible={isVisible}
        onBackdropPress={handleClose}
        backdropOpacity={0.8}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={styles.modal}
      >
        <View style={[
          styles.optionsContainer,
          menuOptionsContainerStyle,
          { height: calculatedHeight, minHeight: calculatedHeight, maxHeight: calculatedHeight }
        ]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {showClearAll && (
              <TouchableOpacity
                key="__clear_all__"
                style={styles.optionItem}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <Reset />
                <Text style={[styles.optionStyle, menuOptionTextStyle]}>
                  {clearAllLabel}
                </Text>
              </TouchableOpacity>
            )}
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => handleToggle(option.value)}
                  activeOpacity={0.7}
                >
                  {/* <Checkbox isSelected={isSelected} /> */}
                  {isSelected ? <Checked /> : <Unchecked />}
                  <Text style={[styles.optionStyle, menuOptionTextStyle]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    margin: 0,
    paddingTop: verticalScale(100),
    paddingRight: scale(15),
  },
  optionsContainer: {
    backgroundColor: 'transparent',
    borderRadius: scale(12),
    padding: scale(10),
    minWidth: scale(200),
    // maxWidth: scale(250),
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollViewContent: {
    paddingBottom: scale(5),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(5),
    gap: scale(6),
    borderRadius: scale(8),
    
  },
  optionItemSelected: {
    // backgroundColor: 'rgba(204, 158, 73, 0.1)',
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(2),
    backgroundColor: colors.white,
  },
  optionStyle: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
    flex: 1,
  },
});

export default MultiSelectMenu;

