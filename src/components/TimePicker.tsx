import { StyleSheet, View } from 'react-native';
import React from 'react';
import DatePickerLib from 'react-native-date-picker';
import { colors } from '../constants/colors';
import { verticalScale } from '../utils/scale';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <View style={styles.container}>
      <DatePickerLib
        date={value}
        onDateChange={onChange}
        mode="time"
        theme="dark"
        format="HH:mm"
        textColor={colors.white}
        fadeToColor="black"
        style={styles.picker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    height: verticalScale(200),
  },
});
