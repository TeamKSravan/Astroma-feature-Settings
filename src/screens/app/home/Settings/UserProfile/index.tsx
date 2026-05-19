import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ToastMessage } from '../../../../../components/ToastMessage';
import ItemUserProfile from '../../../../../components/Home/ItemUserProfile';
import EmptyList from '../../../../../components/Common/ListEmptyComponent';

function UserProfile({ navigation }: any) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState<any>(null);
    const [data, setData] = useState<Array<any>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { getUserDetail, deleteUser, selectedUser, setSelectedUser, setSecondaryUserdata, secondaryUserdata } = useProfileStore();

    const hasFetchedRef = useRef(false);

    const fetchUserDetail = useCallback(async () => {
        setIsLoading(true);
        const result = await getUserDetail();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setData([]);
        }
        setIsLoading(false);
    }, [getUserDetail]);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchUserDetail();
    }, [fetchUserDetail]);

    const handleDelete = useCallback(async (user: any) => {
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
    }, [deleteUser, selectedUser, setSelectedUser, setSecondaryUserdata, secondaryUserdata, fetchUserDetail]);

    const deleteProfile = useCallback(() => {
        if (selectedUserData) {
            handleDelete(selectedUserData);
            setShowDeleteModal(false);
        }
    }, [selectedUserData, handleDelete]);

    const closeDeleteModal = useCallback(() => setShowDeleteModal(false), []);
    const closeEditModal = useCallback(() => setShowEditModal(false), []);
    const keyExtractor = useCallback((item: any) => item._id?.$oid, []);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <ItemUserProfile
            user={item}
            onEdit={() => {
                setShowEditModal(true);
                setSelectedUserData(item);
            }}
            onDelete={() => {
                setShowDeleteModal(true);
                setSelectedUserData(item);
            }}
        />
    ), []);

    const header = useMemo(() => (
        <View style={styles.headerContainer}>
            <BackButton />
            <View style={styles.headerView}>
                <Profile />
                <View style={styles.helloView}>
                    <Text style={styles.nameText}>{i18n.t('userProfile.title')}</Text>
                </View>
            </View>
        </View>
    ), []);

    const listEmptyComponent = useMemo(() => (
        <EmptyList
            addUser={() => navigation.navigate('OnboardingScreen', { onBoardType: 'combatUser', onGoBack: fetchUserDetail })}
            title={i18n.t('userProfile.emptyListTitle')}
            description={i18n.t('userProfile.emptyListDescription')}
            addUserText={i18n.t('userProfile.addUserText')}
        />
    ), [navigation, fetchUserDetail]);

    const userList = useMemo(() => (
        !isLoading ? (
            <FlatList
                data={data}
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListEmptyComponent={listEmptyComponent}
            />
        ) : null
    ), [isLoading, data, keyExtractor, renderItem, listEmptyComponent]);

    const deleteModal = useMemo(() => (
        <DeleteModal closeModal={closeDeleteModal} visible={showDeleteModal} handleVerify={deleteProfile} />
    ), [showDeleteModal, closeDeleteModal, deleteProfile]);

    const editModal = useMemo(() => (
        <EditUserProfile userdata={selectedUserData} closeModal={closeEditModal} visible={showEditModal} reload={fetchUserDetail} />
    ), [selectedUserData, showEditModal, closeEditModal, fetchUserDetail]);

    const loader = useMemo(() => (
        isLoading ? <Loader /> : null
    ), [isLoading]);

    return (
        <BaseView backgroundImage={imagepath.walletBg}>
            {header}
            {userList}
            {deleteModal}
            {editModal}
            {loader}
        </BaseView>
    );
}

export default React.memo(UserProfile);

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
