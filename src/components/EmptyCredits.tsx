import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Warning } from '../constants/svgpath';
import { colors } from '../constants/colors';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import i18n from '../translation/i18n';
import { useNavigation } from '@react-navigation/native';

export default function CoinComponent() {
    const navigation = useNavigation();
    return (
        <View style={styles.Container}>
            <View style={styles.titleContainer}>
                <Warning />
                <Text style={styles.title}>
                    {i18n.t('emptyCredits.title')}
                </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => (navigation as any).navigate('BottomTabNavigator', { screen: 'Wallet' })}>
                <Text style={styles.buttonText} numberOfLines={1}>{i18n.t('emptyCredits.button')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    Container: {
        flexDirection: 'row',
        minHeight: verticalScale(70),
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: scale(10),
        paddingHorizontal: scale(10),
        backgroundColor: colors.modalbg,
        borderRadius: moderateScale(10),
        marginBottom: verticalScale(10),
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: moderateScale(13),
        color: colors.white,
        flexShrink: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginRight: scale(5),
        flex: 1,
        minWidth: 0,
    },
    button: {
        backgroundColor: colors.white,
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
        flexShrink: 0,
    },
    buttonText: {
        fontFamily: fonts.bold,
        fontSize: moderateScale(12),
        color: colors.black,
    }
});
