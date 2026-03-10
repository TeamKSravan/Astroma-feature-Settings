import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useState } from 'react';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import BackButton from '../../../components/BackButton';
import { Calender, Horoscope, Lucky, Moon, Compatibility } from '../../../constants/svgpath';

enum NotificationType {
    calender = 'calender',
    compatibility = 'compatibility',
    horoscope = 'horoscope',
    lucky = 'lucky',
    moon = 'moon',
}

export default function NotificationScreen(props: any) {
    const data = [
        {
            id: 1,
            title: 'Daily Horoscope Ready',
            subtitle: 'Your Pisces daily horoscope for today is ready. Tap to read your cosmic insights.',
            date: '2 min ago',
            type: NotificationType.horoscope,
            isRead: false,
        },
        {
            id: 1,
            title: 'Moon Phase Alert',
            subtitle: 'Full Moon in Leo tonight! Great time for creative pursuits and self-expression.',
            date: '1 hour ago',
            type: NotificationType.moon,
            isRead: false,
        },
        {
            id: 1,
            title: 'Compatibility Match',
            subtitle: 'New compatibility report available. Check how well you match with Aries!',
            date: '3 hours ago',
            type: NotificationType.compatibility,
            isRead: false,
        },
        {
            id: 1,
            title: 'Lucky Period Ahead',
            subtitle: 'Jupiter enters your sign this week. Expect positive changes in career and finances.',
            date: '5 hours ago',
            type: NotificationType.lucky,
            isRead: false,
        },
        {
            id: 1,
            title: 'Mercury Retrograde Ending',
            subtitle: 'Mercury retrograde ends tomorrow. Communication issues will start to resolve.',
            date: '2 days ago',
            type: NotificationType.calender,
            isRead: false,
        },
    ];
    const [refreshing, setRefreshing] = useState(false);

    const NotiIcon = ({ type }: { type: NotificationType }) => {
        switch (type) {
            case NotificationType.calender:
                return <Calender />
            case NotificationType.compatibility:
                return <Compatibility />
            case NotificationType.horoscope:
                return <Horoscope />
            case NotificationType.lucky:
                return <Lucky />
            case NotificationType.moon:
                return <Moon />
            default:
                return <View />
        }

    }



    const onRefresh = async () => {
        setRefreshing(true);

        setRefreshing(false);
    };

    const RenderItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.notificationItemContainer}>
                <View style={styles.notificationItemRow}>
                    <View style={styles.notiIconContainer}>
                        <NotiIcon type={item.type} />
                    </View>
                    <View style={styles.notificationItemLeft}>
                        <Text style={styles.notificationItemTitle}>{item.title}</Text>
                        <Text numberOfLines={2} ellipsizeMode='tail' style={styles.notificationItemSubtitle}>{item.subtitle}</Text>
                        <Text style={styles.notificationItemDate}>{item.date}</Text>
                    </View>
                    <View style={styles.markTag} />
                </View>
            </View>
        );
    };
    return (
        <BaseView backgroundImage={imagepath.NotificationBG}>
            <View style={styles.headerContainer}>
                <BackButton style={styles.backButton} />
                <View style={styles.headerView}>
                    <View style={styles.helloView}>
                        <Text style={styles.nameText}>{'Notifications'}</Text>
                    </View>
                    <TouchableOpacity style={styles.markAllReadContainer}>
                        <Text style={styles.markAllReadText}>{'Mark all read'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.mainView}>
                <FlatList
                    data={data}
                    renderItem={RenderItem}
                    keyExtractor={(item) => item.id.toString()}
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
                />
            </View>
        </BaseView>
    );
}

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
    notiIconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    notificationItemContainer: {
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
    },
    notificationItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationItemLeft: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: scale(5),
        paddingVertical: verticalScale(5),
    },
    notificationItemTitle: {
        color: colors.white,
        fontFamily: fonts.bold,
        fontSize: moderateScale(14),
    },
    notificationItemSubtitle: {
        color: colors.lightYellow,
        fontFamily: fonts.regular,
        fontSize: moderateScale(12),
    },
    notificationItemDate: {
        marginTop: verticalScale(5),
        color: colors.lightYellow,
        fontFamily: fonts.regular,
        fontSize: moderateScale(10),
    },
    notificationItemSeparator: {
        height: 0.5,
        backgroundColor: colors.lightGray,
        marginHorizontal: scale(15),
        marginVertical: verticalScale(5),
    },
    markTag:  {
        width: scale(7),
        height: scale(7),
        borderRadius: scale(3.5),
        backgroundColor: colors.red2,
        margin: scale(5),
    },
});
