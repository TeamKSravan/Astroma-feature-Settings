import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale } from '../../utils/scale';
import WebView from 'react-native-webview';
import { Cross, Expand } from '../../constants/svgpath';
import { useNavigation } from '@react-navigation/native';
import i18n from '../../translation/i18n';

type PdfViewerModalProps = {
    closeModal: () => void;
    visible: boolean;
    pdfUrl: string;
    title?: string;
};

export default function PdfViewerModal({
    closeModal,
    visible,
    pdfUrl,
    title,
}: PdfViewerModalProps) {
    const navigation = useNavigation();
    const HeaderComponent = () => <View style={styles.buttonContainer}>
        <View style={styles.reportButtonView}>
            <Text style={styles.buttonText}>{title ?? i18n.t('report.defaultTitle')}</Text>
        </View>
        <TouchableOpacity style={styles.buttonView} onPress={() => {
            navigation.navigate('PdfViewer', { pdfUrl: pdfUrl, title: title ?? i18n.t('report.defaultTitle') })
            closeModal()
        }}>
            <Expand width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonView} onPress={closeModal}>
            <Cross width={30} height={30} />
        </TouchableOpacity>
    </View >


    const getPdfUrl = () => {
       if(Platform.OS === 'android') {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
       }
       return pdfUrl;
    }
    return (
        <Modal
            animationIn="fadeIn"
            animationOut="fadeOut"
            onBackdropPress={closeModal}
            backdropOpacity={0.8}
            isVisible={visible}
        >
            <View style={styles.modalView}>
                <HeaderComponent />
                <WebView
                    source={{ uri: getPdfUrl() }}
                    style={styles.webView}
                    originWhitelist={['*']}
                    javaScriptEnabled
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: colors.modalbg,
        width: '100%',
        height: '70%',
        borderRadius: 16,
        padding: 10,
    },
    reportButtonView: {
        backgroundColor: colors.modalbg,
        flex: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
    },
    buttonView: {
        backgroundColor: colors.modalbg,
        borderRadius: 50,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: scale(16),
        color: colors.white,
        fontFamily: fonts.regular,
        lineHeight: 34,
    },
    ceneteredView: {
        flex: 1,
        marginTop: 17,
        alignItems: 'center',
        paddingHorizontal: 20,
        // backgroundColor: colors.white,
    },
    deleteTitle: {
        fontSize: scale(24),
        color: colors.white,
        fontFamily: fonts.bold,
        textAlign: 'center',
        marginTop: 20,
    },
    deleteText: {
        fontSize: scale(14),
        color: colors.lightGray,
        fontFamily: fonts.semiBold,
        lineHeight: 25,
        marginBottom: 15,
        textAlign: 'center',
    },
    areText: {
        fontSize: moderateScale(12),
        color: colors.lightGray,
        fontFamily: fonts.medium,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 12,
    },
    noView: {
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(25),
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
    },
    yesView: {
        backgroundColor: colors.red600,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(25),
        flex: 1,
    },
    noText: {
        fontSize: moderateScale(16),
        color: colors.black,
        fontFamily: fonts.regular,
        lineHeight: 34,
    },
    yesText: {
        fontSize: moderateScale(16),
        color: colors.black,
        fontFamily: fonts.regular,
        lineHeight: 34,
    },
    logoutimg: {
        height: 34,
        width: 34,
        marginTop: 10
    },
    webView: {
        flex: 1,
        borderRadius: 16,
    },
});
