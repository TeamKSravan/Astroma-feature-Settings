import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BackArrow2 } from '../constants/svgpath';
import { colors } from '../constants/colors';
import { scale } from '../utils/scale';
import { useNavigation } from '@react-navigation/native';

export default function BackButton({ onBackPress = undefined, style = {} }: { onBackPress?: () => void, style?: StyleProp<ViewStyle> }) {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            style={[styles.backButton, style]}
            activeOpacity={0.8}
            onPress={onBackPress ? onBackPress : () => navigation.goBack()}
        >
            <BackArrow2 width={scale(12)} height={scale(12)} color={colors.white} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        left: scale(10),
        width: scale(24),
        height: scale(24),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.modalbg,
        borderRadius: scale(5),
    },
});