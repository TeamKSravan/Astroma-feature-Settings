import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
  DARK_THEME,
} from 'react-native-country-picker-modal';
import { colors } from '../constants/colors';
import { moderateScale, scale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import { DropDown } from '../constants/svgpath';

interface CountryCodePickerProps {
  selectedCode?: CountryCode;
  selectedCountry?: Country | null;
  onSelect: (country: Country) => void;
  editable?: boolean;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  selectedCode = 'IN',
  selectedCountry = null,
  onSelect,
  editable = true,
}) => {
  const [countryCode, setCountryCode] = useState<CountryCode>(selectedCountry?.cca2 ?? selectedCode);
  const [visible, setVisible] = useState(false);
  const [callingCode, setCallingCode] = useState(selectedCountry?.callingCode?.[0] ?? '91');

  useEffect(() => {
    if (selectedCountry) {
      setCountryCode(selectedCountry.cca2);
      setCallingCode(selectedCountry.callingCode?.[0] ?? '91');
    } else if (selectedCode) {
      setCountryCode(selectedCode);
    }
  }, [selectedCountry, selectedCode]);

  useEffect(() => {
    if (!editable) setVisible(false);
  }, [editable]);

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    onSelect(country);
    setVisible(false);
  };

  return (
    <TouchableOpacity
      activeOpacity={editable ? 0.8 : 1}
      style={styles.container}
      onPress={() => editable && setVisible(true)}
    >
      <View style={styles.triggerContent} pointerEvents={editable ? 'auto' : 'none'}>
        <CountryPicker
          countryCode={countryCode}
          withFilter
          withFlag
          withCallingCode
          withEmoji
          onSelect={onSelectCountry}
          visible={editable && visible}
          onClose={() => setVisible(false)}
          containerButtonStyle={styles.pickerButton}
          theme={DARK_THEME}
        />
        <Text style={styles.codeText}>+{callingCode}</Text>
        <DropDown />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: scale(8),
    borderRightWidth: 0.4,
    borderRightColor: colors.primary,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButton: {
    marginRight: scale(4),
  },
  codeText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontFamily: fonts.regular,
    marginRight: scale(4),
    marginLeft: scale(-6),
  },
  arrow: {
    color: colors.lightGray,
    fontSize: moderateScale(10),
  },
});

export default CountryCodePicker;
