import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ScrollView } from 'react-native';
import BaseView from '../../../../utils/BaseView';
import imagepath from '../../../../constants/imagepath';

import { BackArrow, BackButton, Delete, Edit, Email, Phone, Profile } from '../../../../constants/svgpath';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import { fonts } from '../../../../constants/fonts';
import { colors } from '../../../../constants/colors';
import i18n from '../../../../translation/i18n';
export default function ContactUs({ navigation }: any) {
    const data = [
        { title: '+1(555) 123-4567', icon: <Phone /> },
        { title: 'astroma@gmail.com', icon: <Email /> },
    ];

    return (
        <BaseView backgroundImage={imagepath.reportBg}>
            <View style={styles.headerView}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
                    <BackButton />
                </TouchableOpacity>
                <View style={styles.helloView}>
                    <Text style={styles.nameText}>{i18n.t('settings.contactUs')}</Text>
                </View>
            </View>
            <ScrollView bounces={false} style={styles.container}>
                <View style={styles.dataContainer}>
                {data.map((item, index) => (
                    <View style={styles.itemcontainerView}>
                        <View style={styles.itemcontainer}>
                            {item.icon}
                            <Text style={styles.userNameText}>{item.title}</Text>
                        </View>
                        {index<data.length-1 && <View style={styles.divider} />}
                    </View>
                ))}
                </View>


            </ScrollView>
        </BaseView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: verticalScale(40),
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: scale(15),
        gap: scale(10),
    },
    helloView: {
        gap: verticalScale(4),
    },
    nameText: {
        color: colors.white,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(16),
    },
    dataContainer: {
        flex: 1,
        gap: verticalScale(10),
        backgroundColor: colors.blur2,
        paddingVertical: verticalScale(10),
    },
    itemcontainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        // backgroundColor: colors.blur,
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(15),
        // marginBottom: verticalScale(8),
        // borderRadius: scale(16),
        gap: scale(10),
    },
    itemcontainerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingVertical: scale(15),
        // gap: scale(10),
    },
    divider: {
        width: '90%',
        height: scale(1),
        backgroundColor: colors.menuBorder,
    },
    profileImage: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(25),
        backgroundColor: colors.black,
    },
    profileInfoView: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    userNameText: {
        flex: 1,
        color: colors.white,
        fontFamily: fonts.bold,
        fontSize: scale(14),
    },
    profileEmailText: {
        color: colors.white,
        fontFamily: fonts.medium,
        fontStyle: 'italic',
        fontSize: scale(10),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: scale(10),
    },
});
