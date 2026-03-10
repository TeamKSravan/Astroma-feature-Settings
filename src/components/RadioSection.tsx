import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, View, Text } from 'react-native';
import { BackArrow2, Checked, Unchecked } from '../constants/svgpath';
import { colors } from '../constants/colors';
import { scale } from '../utils/scale';
import { useNavigation } from '@react-navigation/native';

import { fonts } from '../constants/fonts';

export default function RadioSection({
    options, 
    selectedValue = null, 
    onSelect
}: {
    options: { label: string, value: string }[],
    selectedValue: string | null,
    onSelect: (value: string) => void
}) {

    return (
        <View style={styles.radioSection}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[styles.radioButton]}
                    activeOpacity={0.8}
                    onPress={() => onSelect(option.value)}
                >
                    {option.value === selectedValue ? <Checked color={colors.primary} /> : <Unchecked color={colors.primary} />}
                    <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    radioSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scale(10),
        gap: scale(10),
    },
    radioButton: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        flexDirection: 'row',
        gap: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(5),
    },
    radioLabel: {
        fontSize: scale(16),
        fontWeight: '500',
        color: colors.lightGray,
        fontFamily: fonts.medium,
    },
});