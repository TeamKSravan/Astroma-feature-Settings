import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ScrollView } from 'react-native';
import BaseView from '../../../../utils/BaseView';
import imagepath from '../../../../constants/imagepath';
import { BackArrow2, Delete, Edit, Profile } from '../../../../constants/svgpath';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import { fonts } from '../../../../constants/fonts';
import { colors } from '../../../../constants/colors';
import i18n from '../../../../translation/i18n';
import DeleteModal from '../../../../components/modals/DeleteModal';
import EditUserProfile from '../../../../components/modals/EditUserProfile';
import BackButton from '../../../../components/BackButton';
import { useProfileStore } from '../../../../store/useProfileStore';
import Loader from '../../../../components/Loader';
import { useAuthStore } from '../../../../store/useAuthStore';
import ZodicSign from '../../../../components/ZodicSign';
import { ToastMessage } from '../../../../components/ToastMessage';
export default function UserProfile({ navigation }: any) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState<any>(null);
    const [emptyMessage, setEmptyMessage] = useState<string>('');
    const [data, setData] = useState<Array<any>>([]);
    const { getUserDetail, deleteUser, selectedUser, setSelectedUser, setSecondaryUserdata, secondaryUserdata } = useProfileStore();
    const { isLoading } = useAuthStore();

    useEffect(() => {
        fetchUserDetail();
    }, []);

    const fetchUserDetail = async () => {
        const result = await getUserDetail();
        console.log('User data : ', result);
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setData([]);
            setEmptyMessage(result.message || i18n.t('userProfile.noData'));
        }
    };

    const handleDelete = async (user: any) => {
        if (user && user._id && user._id.$oid) {
            const result = await deleteUser(user._id.$oid);
            console.log('deleteUser result : ', result);
            if (result.success) {
                if(selectedUser?._id?.$oid == user?._id?.$oid){
                    setSelectedUser(null);
                }

                setSecondaryUserdata(secondaryUserdata?.filter((item: any) => item?._id?.$oid !== user?._id?.$oid) ?? []);
                fetchUserDetail();
                setShowDeleteModal(false);
            } else {
                console.log('Failed to delete profile:', result.message);
                ToastMessage(result.message || i18n.t('userProfile.deletedFailed'));
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
    return (
        <BaseView backgroundImage={imagepath.walletBg}>
            <View style={styles.headerContainer}>
                <BackButton />
                <View style={styles.headerView}>
                    <Profile />
                    <View style={styles.helloView}>
                        <Text style={styles.nameText}>{i18n.t('userProfile.title')}</Text>
                    </View>
                </View>
            </View>
            <ScrollView bounces={false} style={styles.container}>
                {data.map((item, index) => (
                    <View style={styles.itemcontainer}>
                        <ZodicSign sign={item.zodiac_sign ?? ''} width={scale(50)} height={scale(50)} />
                        <View style={styles.profileInfoView}>
                            <Text style={styles.userNameText}>{item.name}   </Text>
                            <Text style={styles.profileEmailText}>{item.date_of_birth}</Text>
                        </View>
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => {
                                setShowEditModal(true)
                                setSelectedUserData(item);
                            }}>
                                <Edit />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => {
                                setShowDeleteModal(true)
                                setSelectedUserData(item);
                            }}>
                                <Delete />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <DeleteModal closeModal={() => setShowDeleteModal(false)} visible={showDeleteModal} handleVerify={deleteProfile} />
                <EditUserProfile userdata={selectedUserData} closeModal={() => setShowEditModal(false)} visible={showEditModal} reload={fetchUserDetail} />
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
        backgroundColor: colors.modalbg,
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(8),
        borderRadius: scale(16),
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
});
