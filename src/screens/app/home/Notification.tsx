import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import BackButton from '../../../components/BackButton';
import { useHomeStore } from '../../../store/useHomeStore';
import ItemNotification from '../../../components/Home/ItemNotification';
import i18n from '../../../translation/i18n';
import ListEmptyComponent from '../../../components/Common/ListEmptyComponent';

function NotificationScreen(props: any) {
    const [data, setData] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { getNotificationList, markAsRead } = useHomeStore();

    useEffect(() => {
        fetchNotificationList();
    }, [getNotificationList]);

    const fetchNotificationList = async () => {
        const result = await getNotificationList();
        if (result.success) {
            setData(result.data);
            setRefreshing(false);
        }
    };

    const markAsReadNotification = async (notificationId: string) => {
        const result = await markAsRead(notificationId);
        if (result.success) {
            fetchNotificationList();
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setData([]);
        await fetchNotificationList();
    };

    const isAllRead = data.every((item) => item.is_read);
    console.log('isAllRead', isAllRead);
    return (
        <BaseView backgroundImage={imagepath.NotificationBG}>
            <View style={styles.headerContainer}>
                <BackButton style={styles.backButton} />
                <View style={styles.headerView}>
                    <View style={styles.helloView}>
                        <Text style={styles.nameText}>{i18n.t('notifications.title')}</Text>
                    </View>
                    {data.length > 0 && !isAllRead && <TouchableOpacity style={styles.markAllReadContainer}>
                        <Text style={styles.markAllReadText}>{i18n.t('notifications.markAllRead')}</Text>
                    </TouchableOpacity>}
                </View>
            </View>

            <View style={styles.mainView}>
                <FlatList
                    data={data}
                    renderItem={({ item }) => <ItemNotification item={item} onPress={(notificationId: string) => markAsReadNotification(notificationId)} />}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    contentContainerStyle={{ paddingBottom: verticalScale(60) }}
                    ItemSeparatorComponent={() => <View style={styles.notificationItemSeparator} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={() => <ListEmptyComponent title={i18n.t('notifications.noNotifications')} noButton={true} />}
                />
            </View>
        </BaseView>
    );
}

export default React.memo(NotificationScreen);

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(10),
    },
    backButton: {
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.modalbg,
    },
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: scale(50),
    },
    helloView: {
        flex: 1,
        gap: verticalScale(4),
    },
    nameText: {
        color: colors.white,
        fontFamily: fonts.bold,
        fontSize: moderateScale(18),
    },
    markAllReadContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginRight: scale(15),
    },
    markAllReadText: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(12),
    },
    notificationItemSeparator: {
        height: 0.5,
        backgroundColor: colors.lightGray,
        marginHorizontal: scale(15),
        marginVertical: verticalScale(5),
    },
});
