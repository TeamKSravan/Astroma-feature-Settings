import { StyleSheet, View } from 'react-native';
import React from 'react';
import DatePicker from 'react-native-date-picker';
import { colors } from '../constants/colors';
import { scale, verticalScale } from '../utils/scale';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DatePickerComponent({
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate = new Date(),
}: DatePickerProps) {
  return (
    <View style={styles.container}>
      <DatePicker
        date={value}
        onDateChange={onChange}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        theme="dark"
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
