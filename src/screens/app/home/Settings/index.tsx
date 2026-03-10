import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Pressable,
    Linking,
} from 'react-native';
import React, { useRef, useEffect } from 'react';
import BaseView from '../../../../utils/BaseView';
import imagepath from '../../../../constants/imagepath';
import i18n from '../../../../translation/i18n';
import { colors } from '../../../../constants/colors';
import {
    fonts,
} from '../../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import { Bell, Contact, DropdownArrow, FaceMask, Language, Logout, Profile, RightArrow, Setting, Transaction } from '../../../../constants/svgpath';
import LogoutModal from '../../../../components/modals/LogoutModal';
import { useAuthStore } from '../../../../store/useAuthStore';
import BackButton from '../../../../components/BackButton';
import ZodicSign from '../../../../components/ZodicSign';


const LanguageDropdown = ({ data = [], value, onChangeText }: { data: any[], value: string, onChangeText: (text: string) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
    const badgeRef = useRef<View>(null);

    const handleToggle = () => {
        if (!isOpen && badgeRef.current) {
            // Measure position when opening
            badgeRef.current.measureInWindow((x, y, width, height) => {
                setDropdownPosition({
                    top: y + height + scale(5),
                    left: x,
                    width: width,
                });
            });
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (itemValue: string) => {
        onChangeText(itemValue);
        setIsOpen(false);
    };

    const selectedLabel = data.find(item => item.value === value)?.label || i18n.t('settings.english');

    return (
        <>
            <View ref={badgeRef} style={styles.DropdownContainer}>
                <TouchableOpacity style={styles.languageBadge} onPress={handleToggle}>
                    <Text style={styles.languageBadgeText}>{selectedLabel}</Text>
                    <DropdownArrow />
                </TouchableOpacity>
            </View>
            {isOpen && <View
                style={[
                    styles.languageDropdownContainer,
                    {
                        top: 50,
                        left: dropdownPosition.left - scale(15),
                        width: dropdownPosition.width || scale(120),
                    },
                ]}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {data.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.languageDropdownItem,
                                value === item.value && styles.languageDropdownItemSelected
                            ]}
                            onPress={() => handleSelect(item.value)}
                        >
                            <Text
                                style={[
                                    styles.languageBadgeText,
                                    value === item.value && styles.languageDropdownItemTextSelected
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>}
        </>
    );
}

const MenuRenderItem = ({ icon, title, onPress, rightComponent, index }: { icon: React.ReactNode, title: string, onPress?: () => void, rightComponent?: React.ReactNode, index: number }) => {
    return (
        <TouchableOpacity style={[styles.menuItemContainer, { zIndex: -(index) }]} onPress={onPress}>
            <View style={styles.menuItemView}>
                {icon}
                <Text style={styles.menuItemText}>{title}</Text>
                {title == i18n.t('settings.changeLanguage') && rightComponent && rightComponent}
            </View>
            <View style={styles.menuItemDivider} />
        </TouchableOpacity>
    );
}

export default function SettingScreen(props: any) {
    const { userDetails, logout } = useAuthStore();
    const [notification, setNotification] = React.useState(true);
    const [showLogoutModal, setShowLogoutModal] = React.useState(false);
    const { isNotificationEnabled, setIsNotificationEnabled, currentLanguage, setCurrentLanguage } = useAuthStore();

    useEffect(() => {
        i18n.locale = currentLanguage;
    }, [currentLanguage]);

    const handleLanguageChange = (locale: string) => {
        setCurrentLanguage(locale);
        i18n.locale = locale;
    };
    const MenuList1 = [
        { icon: <FaceMask />, title: i18n.t('settings.rateUs'), onPress: () => { openDummyPlayStore() } },
        { icon: <Contact />, title: i18n.t('settings.contactUs'), onPress: () => { props.navigation.navigate('ContactUs') } },
        { icon: <Transaction />, title: i18n.t('settings.transactionHistory'), onPress: () => { props.navigation.navigate('TransactionHistory') } },
        { icon: <Profile />, title: i18n.t('settings.userProfile'), onPress: () => { props.navigation.navigate('UserProfile') } },
    ]
    
    const MenuList2 = [
        { icon: <Language />, title: i18n.t('settings.changeLanguage'), onPress: () => { } },
        { icon: <Logout />, title: i18n.t('settings.logout'), onPress: () => { setShowLogoutModal(true) } },
    ]

    const openDummyPlayStore = () => {
        Linking.openURL(
            "https://play.google.com/store/apps/details?id=com.example.dummyapp"
        );
    };
    return (
        <BaseView backgroundImage={imagepath.reportBg}>
            <View style={styles.headerContainer}>
                <BackButton />
                <View style={styles.headerView}>
                    <Setting />
                    <View style={styles.helloView}>
                        <Text style={styles.nameText}>{i18n.t('settings.title')}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.mainView}>
                <ScrollView bounces={false}>
                    <TouchableOpacity style={styles.container} onPress={() => props.navigation.navigate('Profile')}>
                        {/* <Image source={imagepath.rashi3} style={styles.profileImage} /> */}
                        <ZodicSign sign={userDetails?.zodiac_sign} />
                        <View style={styles.profileInfoView}>
                            <Text style={styles.userNameText}>{userDetails?.name}</Text>
                            {/* <Text style={styles.profileEmailText}>mariapunto@gmail.com</Text> */}
                        </View>
                        <RightArrow />
                    </TouchableOpacity>

                    <View style={styles.notificationView}>
                        <Bell />
                        <Text style={styles.notificationText}>{i18n.t('settings.notification')}</Text>
                        <Switch 
                        thumbColor={colors.white}
                        ios_backgroundColor={colors.lightGray}
                        trackColor={{ false: colors.lightGray, true: '#4BB05D' }} 
                        value={isNotificationEnabled} 
                        onValueChange={setIsNotificationEnabled} />
                    </View>

                    <View style={styles.menuListContainer}>
                        {MenuList1.map((item, index) => (
                            <MenuRenderItem index={index} key={index} icon={item.icon} title={item.title} onPress={item.onPress} />
                        ))}
                    </View>

                    <View style={styles.menuListContainer}>
                        {MenuList2.map((item, index) => (
                            <MenuRenderItem
                                index={index}
                                key={index}
                                icon={item.icon}
                                title={item.title}
                                onPress={item.onPress}
                                rightComponent={index == 0 &&
                                    <LanguageDropdown
                                        data={[
                                            { label: i18n.t('settings.english'), value: 'en' },
                                            { label: i18n.t('settings.hindi'), value: 'hi' },
                                        ]}
                                        value={currentLanguage}
                                        onChangeText={handleLanguageChange}
                                    />
                                }
                            />
                        ))}
                    </View>
                    <LogoutModal closeModal={() => setShowLogoutModal(false)} visible={showLogoutModal} />
                </ScrollView>
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
    dateText: {
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(12),
    },

    coinView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(20),
        gap: scale(15),
    },
    signContainer: {
        alignItems: 'center',
    },
    circle: {
        borderRadius: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    plusIcon: {
        color: colors.white,
        fontSize: moderateScale(32),
        fontFamily: fonts.bold,
    },
    scrollContent: {
        paddingTop: verticalScale(10),
        gap: verticalScale(16),
        paddingHorizontal: scale(20),
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
    yellowView: {
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: moderateScale(30),
        opacity: 0.7,
        paddingHorizontal: scale(20),
    },
    nameView: {
        gap: 4,
        flex: 1,
        marginTop: verticalScale(10),
        // flexShrink: 1,
    },
    optionsView: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        gap: 6,
        marginTop: verticalScale(10),
        marginBottom: verticalScale(14),
    },
    signsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(10),
    },
    titleContainer: {
        flexDirection: 'row',
        borderWidth: 0.4,
        borderColor: colors.primary, // or colors.border
        borderRadius: scale(25),
        height: verticalScale(24),
        paddingHorizontal: scale(10),
        alignItems: 'center',
    },
    labelText: {
        color: colors.lightYellow,
        fontFamily: fonts.regular,
        fontSize: moderateScale(8),
    },
    valueText: {
        color: colors.white,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(10),
    },
    overView: {
        flexDirection: 'row',
        marginTop: verticalScale(20),
        paddingHorizontal: scale(20),
    },
    overText: {
        color: colors.white,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(20),
    },
    paraText: {
        color: colors.lightYellow,
        fontFamily: fonts.regular,
        fontSize: moderateScale(12),
        paddingHorizontal: scale(20),
    },
    menuItemContainer: {
        alignItems: 'center',
    },
    menuItemView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        backgroundColor: colors.blur,
    },
    menuItemText: {
        flex: 1,
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(16),
        marginLeft: scale(12),
    },
    languageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(6),
        borderRadius: scale(20),
        gap: scale(6),
    },
    languageBadgeText: {
        color: colors.black,
        fontFamily: fonts.regular,
        fontSize: moderateScale(10),
    },
    menuItemDivider: {
        width: '90%',
        height: scale(1),
        backgroundColor: colors.menuBorder,
    },
    profileImage: {
        width: scale(50),
        height: scale(50),
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
        fontSize: moderateScale(18),
    },
    profileEmailText: {
        color: colors.white,
        fontFamily: fonts.medium,
        fontStyle: 'italic',
        fontSize: moderateScale(14),
    },
    notificationView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        backgroundColor: colors.blur,
    },
    notificationText: {
        flex: 1,
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(16),
        marginLeft: scale(12),
    },
    menuListContainer: {
        marginTop: verticalScale(20),
    },
    DropdownContainer: {
        right: scale(10),
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    languageDropdownContainer: {
        backgroundColor: colors.white,
        borderRadius: scale(10),
        position: 'absolute',
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
        maxHeight: verticalScale(200),
    },
    languageDropdownItem: {
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(10),
    },
    languageDropdownItemSelected: {
        backgroundColor: colors.primary + '15',
    },
    languageDropdownItemTextSelected: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
    },
});
