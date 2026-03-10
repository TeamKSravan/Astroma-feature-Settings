import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import React, { useState } from 'react';
import BaseView from '../../../../utils/BaseView';
import imagepath from '../../../../constants/imagepath';
import CommonHeader from '../../../../components/CommonHeader';
import { BackButton } from '../../../../constants/svgpath';
import { colors } from '../../../../constants/colors';
import { fonts } from '../../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import WebView from 'react-native-webview';

export default function PdfViewerScreen(props: any) {
    const { pdfUrl, title } = props.route.params;
    console.log('pdfUrl', pdfUrl);
    const getPdfUrl = () => {
        if (Platform.OS === 'android') {
            return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
        }
        return pdfUrl;
    }
    return (
        <BaseView backgroundImage={imagepath.reportBg}>
            <CommonHeader
                LeftComponent={
                    <View style={styles.leftContainer}>
                        <BackButton onPress={() => props.navigation.goBack()} />
                        <Text style={styles.leftText}>{title}</Text>
                    </View>}
            />
            <WebView
                source={{ uri: getPdfUrl() }}
                style={styles.webView}
                originWhitelist={['*']}
                javaScriptEnabled
            />
        </BaseView>
    );
}

const styles = StyleSheet.create({
    tabView: {
        flex: 1,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    leftText: {
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(14),
    },
    webView: {
        flex: 1,
    },
});
