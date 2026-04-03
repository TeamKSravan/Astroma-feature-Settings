import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import { Calender, Compatibility, Horoscope, Lucky, Moon } from '../../constants/svgpath';
import { timeAgo } from '../../utils/methods';

interface Notification {
    _id: string;
    title: string;
    message: string;
    /** API may use send_at or sent_at */
    send_at?: string;
    sent_at?: string;
    is_read: boolean;
    type: NotificationType;
}

interface ItemNotificationProps {
    item: Notification;
    onPress: (notificationId: string) => void;
}

export enum NotificationType {
    calender = 'calender',
    compatibility = 'compatibility',
    horoscope = 'horoscope',
    lucky = 'lucky',
    moon = 'moon',
}


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
            return <Lucky />
    }

}

const ItemNotification = ({ item, onPress }: ItemNotificationProps) => {
    const sentAt = item.send_at ?? item.sent_at;
    return (
        <TouchableOpacity testID="item-notification" style={styles.notificationItemContainer} onPress={() => onPress(item._id)}>
            <View style={styles.notificationItemRow}>
                <View style={styles.notiIconContainer}>
                    <NotiIcon type={item.type} />
                </View>
                <View style={styles.notificationItemLeft}>
                    <Text style={styles.notificationItemTitle}>{item.title}</Text>
                    <Text numberOfLines={2} ellipsizeMode='tail' style={styles.notificationItemSubtitle}>{item.message}</Text>
                    <Text style={styles.notificationItemDate}>{timeAgo(sentAt) || ''}</Text>
                </View>
                {!item.is_read && <View style={styles.markTag} />}
            </View>
        </TouchableOpacity>
    );
};
export default React.memo(ItemNotification);


const styles = StyleSheet.create({
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
    markTag: {
        width: scale(7),
        height: scale(7),
        borderRadius: scale(3.5),
        backgroundColor: colors.red2,
        margin: scale(5),
    },
});
