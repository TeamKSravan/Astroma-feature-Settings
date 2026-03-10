import { Animated, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ModalClose, More } from '../../../constants/svgpath';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import imagepath from '../../../constants/imagepath';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import CustomButton from '../../../components/CustomButton';
import i18n from '../../../translation/i18n';
import { useNavigation } from '@react-navigation/native';
import { useCompatibilityStore } from '../../../store/useCompatibilityStore';
import CustomDropdown from '../../../components/CustomDropdown';
import { useAuthStore, UserDetails } from '../../../store/useAuthStore';
import { ToastMessage } from '../../../components/ToastMessage';
import OptionMenu from '../../../components/OptionMenu';
import { useProfileStore } from '../../../store/useProfileStore';
import Loader from '../../../components/Loader';
import GenerateReportModal from '../../../components/modals/GenerateReportModal';
import PdfViewerModal from '../../../components/modals/PdfViewerModal';
import ZodicSign from '../../../components/ZodicSign';
import { useWalletStore } from '../../../store/useWalletStore';
import EmptyCredits from '../../../components/EmptyCredits';
import CategorySign, { Type } from '../../../components/CategorySign';
import CoinSummaryModal from '../../../components/modals/CoinSummary';

export default function Compare(props: any) {
  const lowerLimit = 10;
  const navigation = useNavigation();
  const { index } = props.route.params;
  const { isLoading, userDetails } = useAuthStore();
  const { getWalletDetails, availableCoins } = useWalletStore();
  const { secondaryUserdata, secondaryUserLimit } = useProfileStore();
  const [compareTypeList, setcompareTypeList] = useState<Array<{ label: string; value: string }>>([]);
  const [compareType, setcompareType] = useState(i18n.t('compat.selectType'));
  const [userList, setUserList] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<Array<UserDetails>>([]);
  const [showCoinSummaryModal, setShowCoinSummaryModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [errorCompare, setErrorCompare] = useState('');
  const [compareUser1, setCompareUser1] = useState<UserDetails | null>(null);
  const [compareUser2, setCompareUser2] = useState<UserDetails | null>(null);
  const [compareUser3, setCompareUser3] = useState<UserDetails | null>(null);
  const [compareUser4, setCompareUser4] = useState<UserDetails | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Sparkle twinkle animation refs (one per CSparkle)
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;
  const sparkle5 = useRef(new Animated.Value(0)).current;
  const sparkle6 = useRef(new Animated.Value(0)).current;
  const sparkle7 = useRef(new Animated.Value(0)).current;
  const sparkle8 = useRef(new Animated.Value(0)).current;
  const sparkle9 = useRef(new Animated.Value(0)).current;

  const createSparkleAnimation = (animValue: Animated.Value, delay: number) => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.25,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.75,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  };

  useEffect(() => {
    if (compareType !== i18n.t('compat.selectType')) {
      setErrorCompare('');
    }
  }, [compareType]);

  const createElementStyle = (animValue: Animated.Value) => {
    const opacity = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.4, 1, 0.5],
    });
    const scale = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.7, 1, 1.2],
    });
    return { opacity, transform: [{ scale }] };
  };

  useEffect(() => {
    createSparkleAnimation(sparkle1, 0);
    createSparkleAnimation(sparkle2, 300);
    createSparkleAnimation(sparkle3, 600);
    createSparkleAnimation(sparkle4, 900);
    createSparkleAnimation(sparkle5, 1200);
    createSparkleAnimation(sparkle6, 1500);
    createSparkleAnimation(sparkle7, 1800);
    createSparkleAnimation(sparkle8, 2100);
    createSparkleAnimation(sparkle9, 2400);
  }, []);

  const { getCompatibilityTypeList, createCompatibilityReport } = useCompatibilityStore();
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      getCompatibilityTypeList(true),
      getWalletDetails(),
    ]).then(([res]) => {
      setcompareTypeList(res?.data?.map((item: any) => ({ label: `${item?.type ? item?.type.charAt(0).toUpperCase() + item?.type.slice(1) : ''} Compare`, value: item?.type })) || []);
    }).finally(() => setRefreshing(false));
  }, [getCompatibilityTypeList, getWalletDetails]);

  const loginuser = {
    name: userDetails?.name || '',
    _id: { $oid: userDetails?.id },
    date_of_birth: userDetails?.dateOfBirth,
    time_of_birth: userDetails?.timeOfBirth,
    place: userDetails?.place,
    lat: userDetails?.lat,
    long: userDetails?.long,
    gender: userDetails?.gender,
  }
  useEffect(() => {
    const mappedUsers = secondaryUserdata?.map((item: any) => ({
      label: item.name || '',
      value: item._id?.$oid || item.id || ''
    })) || [];
    setUserList([{ label: userDetails?.name, value: userDetails?.id }, ...mappedUsers, { label: 'Add Profile + ', value: 'addProfile' }]);
    // Helper function to check if a user still exists in secondaryUserdata or is the login user
    const isUserAvailable = (user: any) => {
      if (!user) return false;
      const userId = user?._id?.$oid || user?.id;
      if (!userId) return false;

      // Check if it's the login user
      if (userId === userDetails?.id) {
        return true;
      }

      // Check if user exists in secondaryUserdata
      return secondaryUserdata?.some((item: any) =>
        (item?._id?.$oid === userId || item?.id === userId)
      ) || false;
    };

    // Update compareUser1-4 if they're no longer available
    if (compareUser1 !== null && !isUserAvailable(compareUser1)) {
      setCompareUser1(null);
    }
    if (compareUser2 !== null && !isUserAvailable(compareUser2)) {
      setCompareUser2(null);
    }
    if (compareUser3 !== null && !isUserAvailable(compareUser3)) {
      setCompareUser3(null);
    }
    if (compareUser4 !== null && !isUserAvailable(compareUser4)) {
      setCompareUser4(null);
    }

    // Update selectedUser to remove users that are no longer available
    setSelectedUser((prevSelectedUser) =>
      prevSelectedUser.filter((user: any) => isUserAvailable(user))
    );
  }, [secondaryUserdata, userDetails]);

  useEffect(() => {
    getCompatibilityTypeList(true).then((res) => {
      console.log('Response from getcompareTypeList', res);
      setcompareTypeList(res.data?.map((item: any) => ({ label: `${item?.type ? item?.type.charAt(0).toUpperCase() + item?.type.slice(1) : ''} Compare`, value: item?.type })));
    });
  }, [getCompatibilityTypeList]);

  const onPressGenerateReport = () => {
    console.log('onPressGenerateReport');
    if (selectedUser.length < 2 || selectedUser.length > 4) {
      ToastMessage('Please select at least 2 and at most 4 users');
      return;
    }
    if (compareType === i18n.t('compat.selectType')) {
      setErrorCompare('Please select a compare type');
      // ToastMessage('Please select a compare type');
      return;
    }
    setShowCoinSummaryModal(true);
  };
  const handleUserSelect = (value: string) => {
    // Handle "Add Profile" case
    if (value === 'addProfile') {
      if (secondaryUserdata?.length <= secondaryUserLimit - 1) {
        navigation.navigate('OnboardingScreen' as never, { onBoardType: 'combatUser' } as never);
        return;
      } else {
        ToastMessage(i18n.t('userList.maxUsers'));
        return;
      }
    }

    // Check if user is already selected (check both _id.$oid and id)
    const isAlreadySelected = selectedUser.some(
      (user: any) => (user?._id?.$oid === value || user?.id === value)
    );

    // Don't add if already selected or if we've reached max 4 users
    if (isAlreadySelected || selectedUser.length >= 4) {
      return;
    }

    // Find the user from secondaryUserdata
    const userToAdd = value == loginuser?._id?.$oid ? loginuser : secondaryUserdata?.find(
      (item: any) => (item?._id?.$oid === value || item?.id === value)
    );

    // Add user if found
    if (userToAdd) {
      setSelectedUser([...selectedUser, userToAdd]);
      if (compareUser1 === null) {
        setCompareUser1(userToAdd);
      } else if (compareUser2 === null) {
        setCompareUser2(userToAdd);
      } else if (compareUser3 === null) {
        setCompareUser3(userToAdd);
      } else if (compareUser4 === null) {
        setCompareUser4(userToAdd);
      } else {
        ToastMessage('You can only select 4 users');
        return;
      }
    }
  };

  const generateCompatibilityReport = () => {
    console.log('generateCompatibilityReport');
    createCompatibilityReport(true, { type: compareType, profile_id: selectedUser.map((item: any) => item?._id?.$oid ?? '') }, true).then(async (res) => {
      console.log('Response from getcompareReport', res);
      if (res.success) {
        setErrorCompare('')
        setShowGenerateReportModal(true);
        setPdfUrl(res.data || '')
        ToastMessage('Report generated successfully');
        await getWalletDetails();
      } else {
        ToastMessage(res.data as string);
      }
    });
  };

  const OptionItem = (option: any) => {
    return (
      <View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionStyle}>{option.label}</Text>
        </View>
        {option.value !== 'addProfile' && <View style={styles.Separator} />}
      </View>
    )
  }

  const filteredUserList = userList?.filter((item: any) => !selectedUser.some((user: any) => user?._id?.$oid === item.value));

  // Helper function to format user date and time
  const formatUserDate = (user: any) => {
    const dateOfBirth = user?.date_of_birth || user?.dateOfBirth || '';
    let timeOfBirth = user?.time_of_birth || user?.timeOfBirth || '';
    // Remove seconds from time format (HH:MM:SS -> HH:MM)
    if (timeOfBirth) {
      timeOfBirth = timeOfBirth.split(':').slice(0, 2).join(':');
    }
    return dateOfBirth && timeOfBirth ? `${dateOfBirth} | ${timeOfBirth}` : '';
  };

  const handleUserRemove = (user: any) => {
    if (compareUser1?._id?.$oid === user?._id?.$oid) {
      setCompareUser1(null);
    } else if (compareUser2?._id?.$oid === user?._id?.$oid) {
      setCompareUser2(null);
    } else if (compareUser3?._id?.$oid === user?._id?.$oid) {
      setCompareUser3(null);
    } else if (compareUser4?._id?.$oid === user?._id?.$oid) {
      setCompareUser4(null);
    }
    setSelectedUser(selectedUser.filter((item: any) => item?._id?.$oid !== user?._id?.$oid));
  }

  // Reusable component for rendering selected user info
  const SelectedUserView = ({
    user,
    index,
    positionStyle,
    onRemove
  }: {
    user: any;
    index: number;
    positionStyle?: any
    onRemove: (user: any) => void;
  }) => {
    if (!user) return null;
    return (
      <View style={positionStyle}>
        <View style={styles.nameView}>
          <TouchableOpacity onPress={() => onRemove(user)} style={styles.closeIcon}>
            <ModalClose width={20} height={20} />
          </TouchableOpacity>
          <View style={styles.userContentContainer}>
            <ZodicSign sign={user?.zodiac_sign || ''} width={80} height={80} />
            <Text style={styles.nameText}>{user?.name || ''}</Text>
            <Text style={styles.dateText}>{formatUserDate(user)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Configuration for selected user positions
  const selectedUserPositions = [
    { index: 0, positionStyle: { alignSelf: 'center' } },
    { index: 1, positionStyle: { top: verticalScale(270), alignSelf: 'center' } },
    { index: 2, positionStyle: { top: verticalScale(90), left: scale(60), alignSelf: 'flex-start' } },
    { index: 3, positionStyle: { top: verticalScale(150), right: scale(60), alignSelf: 'flex-end' } },
  ];

  return (
    <View style={styles.mainView}>
      <>
        <CustomDropdown
          data={compareTypeList || []}
          placeholder={i18n.t('compat.selectType')}
          value={compareType}
          onChangeText={setcompareType}
          inputStyle={{
            width: '95%',
            alignSelf: 'center',
          }}
          isModal={true}
          closeTrigger={index}
        />
        <Text style={styles.errorText}>{errorCompare}</Text>
      </>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.imageView}>
          <Animated.View style={[styles.sparklelevel4, { top: verticalScale(220) }, createElementStyle(sparkle1)]}>
            <Image source={imagepath.CSparkle} style={{ width: 16, height: 16 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel4, { top: verticalScale(150), left: scale(20) }, createElementStyle(sparkle2)]}>
            <Image source={imagepath.CSparkle} style={{ width: 16, height: 16 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel4, { top: verticalScale(330), left: scale(60) }, createElementStyle(sparkle3)]}>
            <Image source={imagepath.CSparkle} style={{ width: 16, height: 16 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel1, { top: verticalScale(200), left: scale(90) }, createElementStyle(sparkle4)]}>
            <Image source={imagepath.CSparkle} style={{ width: 10, height: 10 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel1, { top: verticalScale(60), left: scale(50) }, createElementStyle(sparkle5)]}>
            <Image source={imagepath.CSparkle} style={{ width: 10, height: 10 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel4, { top: verticalScale(60), right: scale(50) }, createElementStyle(sparkle6)]}>
            <Image source={imagepath.CSparkle} style={{ width: 16, height: 16 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel1, { top: verticalScale(160), right: scale(20) }, createElementStyle(sparkle7)]}>
            <Image source={imagepath.CSparkle} style={{ width: 10, height: 10 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel1, { top: verticalScale(240), right: scale(100) }, createElementStyle(sparkle8)]}>
            <Image source={imagepath.CSparkle} style={{ width: 10, height: 10 }} />
          </Animated.View>
          <Animated.View style={[styles.sparklelevel1, { top: verticalScale(330), right: scale(10) }, createElementStyle(sparkle9)]}>
            <Image source={imagepath.CSparkle} style={{ width: 10, height: 10 }} />
          </Animated.View>
          <OptionMenu
            options={filteredUserList}
            triggerComponent={
              <Image source={imagepath.AddUser} style={styles.img} />
            }
            style={styles.addIcon1}
            onSelect={handleUserSelect}
            customMenuComponent={OptionItem}
          />
          <OptionMenu
            options={filteredUserList}
            triggerComponent={
              <Image source={imagepath.AddUser} style={styles.img} />
            }
            style={styles.addIcon2}
            onSelect={handleUserSelect}
            customMenuComponent={OptionItem}

          />
          <SelectedUserView
            user={compareUser1}
            index={0}
            positionStyle={selectedUserPositions[0].positionStyle}
            onRemove={handleUserRemove}
          />
          <SelectedUserView
            user={compareUser2}
            index={1}
            positionStyle={selectedUserPositions[1].positionStyle}
            onRemove={handleUserRemove}
          />
          <SelectedUserView
            user={compareUser3}
            index={2}
            positionStyle={selectedUserPositions[2].positionStyle}
            onRemove={handleUserRemove}
          />
          <SelectedUserView
            user={compareUser4}
            index={3}
            positionStyle={selectedUserPositions[3].positionStyle}
            onRemove={handleUserRemove}
          />
          <View style={styles.centeredSparkleContainer}>
            <CategorySign sign={compareType} width={40} height={40} type={Type.bw} />
          </View>
        </View>
      </ScrollView>
      <CustomButton
        title={i18n.t('compat.generate')}
        style={styles.generate}
        onPress={onPressGenerateReport}
      />
      {isLoading && <Loader />}
      <CoinSummaryModal
        title={`Download ${compareType.charAt(0).toUpperCase() + compareType.slice(1)} ${i18n.t('compat.compareReport')}`}
        cost={10}
        closeModal={() => { setShowCoinSummaryModal(false) }}
        visible={showCoinSummaryModal}
        paynow={generateCompatibilityReport} />
      {availableCoins < lowerLimit && <View style={styles.emptyCreditsContainer}>
        <EmptyCredits />
      </View>}
      <GenerateReportModal
        closeModal={() => { setShowGenerateReportModal(false) }}
        visible={showGenerateReportModal}
        handleViewReport={() => {
          setShowGenerateReportModal(false)
          setShowPdfViewerModal(true)
        }}
      />
      <PdfViewerModal
        closeModal={() => { setShowPdfViewerModal(false) }}
        visible={showPdfViewerModal}
        pdfUrl={pdfUrl}
        title={`${compareType.charAt(0).toUpperCase() + compareType.slice(1)} ${i18n.t('compat.compareReport')}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  img: {
    marginTop: verticalScale(20),
  },
  addIcon1: {
    position: 'absolute',
    top: scale(220),
    left: scale(10),
  },
  addIcon2: {
    position: 'absolute',
    top: verticalScale(70),
    right: scale(10),
  },
  nameText: {
    color: colors.primary,
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
    textAlign: 'center',
    maxWidth: scale(100),
  },
  dateText: {
    color: colors.gray,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  nameView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    zIndex: 99,
    top: verticalScale(20),
    minWidth: scale(100),
  },
  userContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageView: {
    marginTop: verticalScale(20),
  },
  scroll: {
    paddingHorizontal: scale(16),
  },
  generate: {
    position: 'absolute',
    bottom: verticalScale(30),
    width: '95%',
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(30),
  },
  sparklelevel1: {
    width: 10,
    height: 10,
    position: 'absolute',
  },
  sparklelevel4: {
    width: 16,
    height: 16,
    position: 'absolute',
  },
  centeredSparkleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(200),
  },
  optionContainer: {
    paddingVertical: verticalScale(7),
  },
  Separator: {
    height: 0.5,
    backgroundColor: colors.primarylight,
    marginTop: verticalScale(7),
  },
  optionStyle: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
  },
  closeIcon: {
    position: 'absolute',
    top: -10,
    right: -0,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 15,
  },
  emptyCreditsContainer: {
    marginBottom: verticalScale(50),
  },
  errorText: {
    color: colors.red2,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(12),
    // textAlign: 'left',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(5),
  },
});
