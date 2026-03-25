import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import BaseView from '../../../../../utils/BaseView';
import imagepath from '../../../../../constants/imagepath';
import { Profile } from '../../../../../constants/svgpath';
import { moderateScale, scale, verticalScale } from '../../../../../utils/scale';
import { fonts } from '../../../../../constants/fonts';
import { colors } from '../../../../../constants/colors';
import i18n from '../../../../../translation/i18n';
import DeleteModal from '../../../../../components/modals/DeleteModal';
import EditUserProfile from '../../../../../components/modals/EditUserProfile';
import BackButton from '../../../../../components/BackButton';
import { useProfileStore } from '../../../../../store/useProfileStore';
import Loader from '../../../../../components/Loader';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { ToastMessage } from '../../../../../components/ToastMessage';
import ItemUserProfile from '../../../../../components/Home/ItemUserProfile';
import EmptyList from '../../../../../components/Common/ListEmptyComponent';
export default function UserProfile({ navigation }: any) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState<any>(null);
    const [data, setData] = useState<Array<any>>([]);
    const { getUserDetail, deleteUser, selectedUser, setSelectedUser, setSecondaryUserdata, secondaryUserdata } = useProfileStore();
    const { isLoading } = useAuthStore();

    useEffect(() => {
        fetchUserDetail();
    }, []);

    const fetchUserDetail = async () => {
        const result = await getUserDetail();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setData([]);
        }
    };

    const handleDelete = async (user: any) => {
        if (user && user._id && user._id.$oid) {
            const result = await deleteUser(user._id.$oid);
            if (result.success) {
                if (selectedUser?._id?.$oid == user?._id?.$oid) {
                    setSelectedUser(null);
                }

                setSecondaryUserdata(secondaryUserdata?.filter((item: any) => item?._id?.$oid !== user?._id?.$oid) ?? []);
                fetchUserDetail();
                setShowDeleteModal(false);
            } else {
                ToastMessage(result.message || i18n.t('userProfile.deletedFailed'));
            }
        }
    };

    const deleteProfile = () => {
        if (selectedUserData) {
            handleDelete(selectedUserData);
            setShowDeleteModal(false);
        }
    };

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
            {data.length > 0 && <FlatList data={data}
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
                keyExtractor={(item) => item._id?.$oid}
                renderItem={({ item }) =>
                    <ItemUserProfile user={item} onEdit={() => {
                        setShowEditModal(true)
                        setSelectedUserData(item);
                    }} onDelete={() => {
                        setShowDeleteModal(true)
                        setSelectedUserData(item);
                    }}
                />}
                ListEmptyComponent={
                <EmptyList addUser={() => {
                    navigation.navigate('OnboardingScreen', { onBoardType: 'combatUser', onGoBack: fetchUserDetail, })
                }} title={i18n.t('userProfile.emptyListTitle')} description={i18n.t('userProfile.emptyListDescription')} addUserText={i18n.t('userProfile.addUserText')} />}
            />}
            <DeleteModal closeModal={() => setShowDeleteModal(false)} visible={showDeleteModal} handleVerify={deleteProfile} />
            <EditUserProfile userdata={selectedUserData} closeModal={() => setShowEditModal(false)} visible={showEditModal} reload={fetchUserDetail} />
            {isLoading && <Loader />}
        </BaseView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(15),
        marginHorizontal: scale(10),
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
});
