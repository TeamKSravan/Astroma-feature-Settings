import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
    Add,
    Aquarius,
    Aries,
    Cancer,
    Capricorn,
    Gemini,
    Leo,
    Libra,
    Pisces,
    Sagittarius,
    Scorpio,
    Taurus,
    Virgo,
} from '../constants/svgpath';
import i18n from '../translation/i18n';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { useNavigation } from '@react-navigation/native';
import { useProfileStore } from '../store/useProfileStore';
import { UserDetails } from '../store/useAuthStore';
import { ToastMessage } from './ToastMessage';
import { capitalizeFirstLetter } from '../utils/methods';

/** API profile rows include Mongo-style ids and zodiac. */
type ProfileListUser = UserDetails & {
    _id?: { $oid?: string };
    zodiac_sign?: string;
};

interface UserListProps {
    primaryUser?: UserDetails;
    showAddUser?: boolean;
    disableUserSelection?: boolean;
    size?: number;
}

type UserIconProps = { sign: string; size?: number };

export const UserIcon = memo(function UserIcon({ sign, size = 55 }: UserIconProps) {
    switch (sign) {
        case 'Aquarius':
            return <Aquarius width={size} height={size} />;
        case 'Aries':
            return <Aries width={size} height={size} />;
        case 'Cancer':
            return <Cancer width={size} height={size} />;
        case 'Capricorn':
            return <Capricorn width={size} height={size} />;
        case 'Gemini':
            return <Gemini width={size} height={size} />;
        case 'Leo':
            return <Leo width={size} height={size} />;
        case 'Libra':
            return <Libra width={size} height={size} />;
        case 'Pisces':
            return <Pisces width={size} height={size} />;
        case 'Sagittarius':
            return <Sagittarius width={size} height={size} />;
        case 'Scorpio':
            return <Scorpio width={size} height={size} />;
        case 'Taurus':
            return <Taurus width={size} height={size} />;
        case 'Virgo':
            return <Virgo width={size} height={size} />;
        default:
            return <Aries width={size} height={size} />;
    }
});

function areUserListPropsEqual(prev: UserListProps, next: UserListProps): boolean {
    if (prev.showAddUser !== next.showAddUser) return false;
    if (prev.disableUserSelection !== next.disableUserSelection) return false;
    if (prev.size !== next.size) return false;
    if (prev.primaryUser === next.primaryUser) return true;
    if (!prev.primaryUser && !next.primaryUser) return true;
    if (!prev.primaryUser || !next.primaryUser) return false;
    return (
        prev.primaryUser.id === next.primaryUser.id &&
        prev.primaryUser.zodiac_sign === next.primaryUser.zodiac_sign &&
        prev.primaryUser.name === next.primaryUser.name
    );
}

function UserList({ primaryUser, showAddUser = true, disableUserSelection = false }: UserListProps) {
    const secondaryUserdata = useProfileStore(state => state.secondaryUserdata);
    const selectedUser = useProfileStore(state => state.selectedUser);
    const setSelectedUser = useProfileStore(state => state.setSelectedUser);
    const secondaryUserLimit = useProfileStore(state => state.secondaryUserLimit);
    const navigation = useNavigation();

    const comparePrimaryUser = useMemo(
        () => primaryUser?.id === selectedUser?.id,
        [primaryUser?.id, selectedUser?.id],
    );

    const onPressAddUser = useCallback(() => {
        const limit = secondaryUserLimit ?? 10;
        if ((secondaryUserdata?.length ?? 0) <= limit - 1) {
            (navigation as { navigate: (name: string, params?: object) => void }).navigate('OnboardingScreen', {
                onBoardType: 'addUser',
            });
        } else {
            ToastMessage(i18n.t('userList.maxUsers'));
        }
    }, [navigation, secondaryUserdata?.length, secondaryUserLimit]);

    const list = (secondaryUserdata ?? []) as ProfileListUser[];
    const selectedOid = (selectedUser as ProfileListUser | null)?._id?.$oid;

    return (
        <View style={styles.Container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                fadingEdgeLength={10}
                persistentScrollbar={true}
            >
                {primaryUser && (
                    <View style={styles.signContainer}>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={comparePrimaryUser ? styles.selectedcircle : styles.circle}
                            onPress={() => (disableUserSelection ? null : setSelectedUser(primaryUser))}
                        >
                            <UserIcon sign={primaryUser?.zodiac_sign ?? ''} />
                        </TouchableOpacity>
                        <Text numberOfLines={1} lineBreakMode="tail" style={styles.profileNameText}>
                            {i18n.t('userList.me')}
                        </Text>
                    </View>
                )}
                {list.map((sign, index) => {
                    const oid = sign._id?.$oid;
                    const key = oid ?? `idx-${index}`;
                    const isSelected = oid != null && oid === selectedOid;
                    return (
                        <View key={key} style={styles.signContainer}>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={isSelected ? styles.selectedcircle : styles.circle}
                                onPress={() =>
                                    disableUserSelection
                                        ? null
                                        : setSelectedUser(
                                              oid === selectedOid ? (null as unknown as UserDetails) : sign,
                                          )
                                }
                            >
                                <UserIcon sign={sign?.zodiac_sign ?? ''} />
                            </TouchableOpacity>
                            <Text numberOfLines={1} lineBreakMode="tail" style={styles.profileNameText}>
                                {capitalizeFirstLetter(sign.name ?? '')}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
            {showAddUser && (
                <View key={list.length} style={[styles.signContainer, styles.addbuttonContainer]}>
                    <TouchableOpacity style={styles.circle} onPress={onPressAddUser}>
                        <Add />
                    </TouchableOpacity>
                    <Text style={styles.profileNameText}>{i18n.t('userList.add')}</Text>
                </View>
            )}
        </View>
    );
}

export default memo(UserList, areUserListPropsEqual);

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    scrollContent: {
        paddingTop: verticalScale(10),
        gap: verticalScale(12),
        paddingLeft: scale(20),
        marginRight: scale(0),
    },
    signContainer: {
        alignItems: 'center',
        width: scale(50),
    },
    addbuttonContainer: {
        marginTop: verticalScale(11),
        marginRight: scale(15),
        marginLeft: scale(15),
    },
    circle: {
        borderRadius: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedcircle: {
        borderRadius: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
        borderWidth: 2,
        borderColor: colors.white,
    },
    plusIcon: {
        color: colors.white,
        fontSize: moderateScale(32),
        fontFamily: fonts.bold,
    },
    profileView: {
        // flexDirection: 'row',
    },
    profileNameText: {
        color: colors.white,
        fontSize: moderateScale(12),
        fontFamily: fonts.bold,
    },
    fullnameText: {
        color: colors.primary,
        fontFamily: fonts.bold,
        fontSize: moderateScale(20),
    },
    zodiacText: {
        color: colors.lightYellow,
        fontFamily: fonts.regular,
        fontSize: moderateScale(12),
    },
    circularView: {
        flexDirection: 'row',
        marginTop: verticalScale(16),
        gap: scale(16),
    },
    circleImg: {
        height: 150,
        width: '100%',
    },
});
