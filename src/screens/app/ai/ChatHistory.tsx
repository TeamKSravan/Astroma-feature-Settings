import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ScrollView, Alert } from 'react-native';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import { BackArrow2, Delete, Edit, BackButton, More, History, NewChat } from '../../../constants/svgpath';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { fonts } from '../../../constants/fonts';
import { colors } from '../../../constants/colors';
import i18n from '../../../translation/i18n';
import DeleteModal from '../../../components/modals/DeleteModal';
import EditConversation from '../../../components/modals/EditConversation';
import { useProfileStore } from '../../../store/useProfileStore';
import Loader from '../../../components/Loader';
import { useAuthStore } from '../../../store/useAuthStore';
import OptionMenu from '../../../components/OptionMenu';
import { useChatStore } from '../../../store/useChatStore';
import { ToastMessage } from '../../../components/ToastMessage';
import { useFocusEffect } from '@react-navigation/native';
export default function ChatHistory({ navigation }: any) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState<any>(null);
    const [iseditConversationModal, setIseditConversationModal] = useState(false);
    const [data, setData] = useState<Array<any>>([]);
    const { getUserDetail, deleteUser, selectedUser } = useProfileStore();
    const { chatHistory, getChatHistory, deleteChatHistory } = useChatStore();
    const { isLoading, token, isAuthenticated, userDetails } = useAuthStore();
    const options = [
        { label: i18n.t('common.delete'), value: 'delete' },
        { label: i18n.t('common.edit'), value: 'edit' },
    ];
    useFocusEffect(
        useCallback(() => {
            fetchChatHistory();
        }, [data.length])
    );

    const fetchChatHistory = async () => {
        try {
            const result = await getChatHistory(selectedUser?._id?.$oid ?? '');
            console.log('Chat history data : ', result);
            if (result.success && result.data) {
                setData([{ title: i18n.t('chatHistory.newChat'), _id: { '$oid': 'new' } }, ...result.data as any]);
            } else {
                navigation.navigate('ChatScreen', { chatHistoryEmpty: true });
                setData([]);
            }
        } catch (error: any) {
            console.error('Error fetching chat history:', error);
            setData([]);

        }
    }

    const handleDelete = async (chatHistory: any) => {
        if (chatHistory?._id?.$oid) {
            const result = await deleteChatHistory(chatHistory?._id?.$oid);
            if (result.success) {
                setData(data.filter((item: any) => item?._id?.$oid !== chatHistory?._id?.$oid));
                fetchChatHistory();
                setShowDeleteModal(false);
                ToastMessage(i18n.t('chatHistory.deletedSuccess'));
            } else {
                console.log('Failed to delete chat history:', result.message);
            }
        }
    };

    const deleteProfile = () => {
        if (selectedUserData) {
            handleDelete(selectedUserData);
            setShowDeleteModal(false);
        }
    }

    const saveChanges = () => {
        console.log('saveChanges');
        setShowEditModal(false);
    }
    const handleOptionSelect = (value: string) => {
        console.log('Selected option:', value);
        if (value === 'delete') {
            setShowDeleteModal(true);
        } else if (value === 'edit') {
            setIseditConversationModal(true);
        }
    }

    if(isLoading) {
        return <BaseView>
            <Loader />
        </BaseView>;
    }
    return (
        <BaseView backgroundImage={imagepath.homeBg}>
            <View style={styles.headerView}>
                {/* <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
                    <BackButton />
                </TouchableOpacity> */}
                <History />
                <View style={styles.helloView}>
                    <Text style={styles.nameText}>{i18n.t('chatHistory.title')}</Text>
                </View>
            </View>
            <ScrollView bounces={false} style={styles.container}>
                {data.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{i18n.t('chatHistory.noHistory')}</Text>
                    </View>
                ) : (
                    data.map((item, index) => index === 0 ? (
                        <TouchableOpacity key={item?._id?.$oid || index} style={styles.itemcontainer} onPress={() => navigation.navigate('ChatScreen')}>
                            <View style={[{ flexDirection: 'row', gap: scale(5) }]}>
                                <NewChat />
                                <Text style={styles.userNameText}>{item.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity key={item?._id?.$oid || index} style={styles.itemcontainer} onPress={() => {
                            navigation.navigate('ChatScreen', { chatHistoryId: item?._id?.$oid });
                        }}>
                            <View style={styles.profileInfoView}>
                                <Text style={styles.userNameText}>{item.title}</Text>
                            </View>
                            <View style={styles.actionButtonsContainer}>
                                <OptionMenu
                                    options={options}
                                    triggerComponent={<More />}
                                    onSelect={(value) => {
                                        setSelectedUserData(item);
                                        handleOptionSelect(value);
                                    }}
                                />
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <DeleteModal
                    closeModal={() => setShowDeleteModal(false)}
                    visible={showDeleteModal}
                    handleVerify={deleteProfile}
                    title={i18n.t('chatHistory.deleteTitle')}
                    description={i18n.t('chatHistory.deleteDescription')}
                />
                <EditConversation title={selectedUserData?.title} id={selectedUserData?._id?.$oid} closeModal={() => setIseditConversationModal(false)} visible={iseditConversationModal} reload={fetchChatHistory} />
            </ScrollView>
            {isLoading && <Loader />}
        </BaseView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        paddingHorizontal: 10,
        marginTop: verticalScale(15),
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
    itemcontainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: colors.dusty,
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(8),
        borderRadius: scale(12),
        gap: scale(20),
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(40),
    },
    emptyText: {
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(14),
        textAlign: 'center',
    },
});
