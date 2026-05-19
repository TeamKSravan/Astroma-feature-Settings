import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { BackArrow } from '../../../constants/svgpath';
import i18n from '../../../translation/i18n';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import BaseView from '../../../utils/BaseView';
import ProgressBar from '../../../components/ProgressBar';
import EnterNameStep from './EnterNameStep';
import EnterDOBStep from './EnterDOBStep';
import GenderStep from './GenderStep';
import CustomButton from '../../../components/CustomButton';
import EnterPlaceStep from './EnterPlaceStep';
import EnterTimeStep from './EnterTimeStep';
import { ToastMessage } from '../../../components/ToastMessage';
import useValidation from '../../../hooks/useValidation';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProfileStore } from '../../../store/useProfileStore';
import Loader from '../../../components/Loader';
import moment from 'moment-timezone';
import EnterPhoneStep from './EnterPhoneStep';

export enum OnBoardType {
  newUser = 'newUser',
  socialLogin = 'socialLogin',
  addUser = 'addUser',
  combatUser = 'combatUser',
}
const tabs = [
  { title: 'phone.phone', key: 'phone' },
  { title: 'name.name', key: 'name' },
  { title: 'time.date', key: 'date' },
  { title: 'time.time', key: 'time' },
  { title: 'place.place', key: 'place' },
  { title: 'gender.gender', key: 'gender' },
];
export default function OnboardingScreen(props: any) {
  const { onBoardType = OnBoardType.newUser } = props.route?.params || {};
  const notSocialLogin = onBoardType !== OnBoardType.socialLogin;
  const STEPS = tabs.slice(notSocialLogin ? 1 : 0);
  //onBoardType !== OnBoardType.socialLogin ? tabs.slice(0,1) : tabs;
  console.log('onBoardType => ', onBoardType);
  console.log('STEPS => ', STEPS);
  const [currentPage, setCurrentPage] = useState(notSocialLogin ? 1 : 0);
  const [error, setError] = useState({});
  const { completeOnboarding, isLoading, setIsGetBonus } = useAuthStore();
  const { addUserDetail, selectedUser, setSelectedUser, } = useProfileStore();
  const { validate } = useValidation();
  const [locationType, setLocationType] = useState<string>('automatic');
  const currentTimeZone = moment.tz.guess()
  const [formData, setFormData] = useState({
    country_code: '+91',
    phone: '',
    name: '',
    dob: new Date("2000-01-01"),
    time: new Date(),
    place: '',
    lat: '',
    long: '',
    gender: null as 'male' | 'female' | 'other' | null,
    timezone: currentTimeZone || ''
  });
  const handleNext = () => {
    // console.log(`formData ${currentPage + 1}: `, formData);
    var validationError = '';
    validationError = validate('phone', formData.phone);
    if(!notSocialLogin){
      if (currentPage === 0 && validationError) {
        console.log('phone validationError : ', validationError);
        setError(prev => ({ ...prev, phone: validationError }));
        return;
      }
    }
    validationError = validate('name', formData.name);
    if (currentPage === (notSocialLogin ? 1 : 2) && validationError) {
      console.log('name validationError : ', validationError);
      setError(prev => ({ ...prev, name: validationError }));
      return;
    }
    validationError = validate('dob', formData.dob);
    if (currentPage === (notSocialLogin ? 2 : 3) && validationError) {
      ToastMessage(validationError);
      return;
    }

    validationError = validate('place', formData.place);
    if (currentPage === (notSocialLogin ? 4 : 5) && validationError) {
      console.log('validationError => ', validationError);
      setError(prev => ({ ...prev, place: validationError }));
      return;
    }

    // console.log('STEPS.length : ', STEPS.length);
    // console.log('currentPage : ', currentPage);
    const stepLength = notSocialLogin ? STEPS.length : STEPS.length - 1
    if (currentPage < stepLength) {
      setCurrentPage(currentPage + 1);
    } else {
      handleSubmit();
    }
  };
  const handleBack = () => {
    if (currentPage > 0) {
      if(notSocialLogin && currentPage === 1){
        props.navigation.goBack();
      } else {
        setCurrentPage(currentPage - 1);
      }
    } else {
      props.navigation.goBack();
    }
  };
  const handleLocationSelect = (lat: string, long: string) => {
    // console.log('handleLocationSelect lat', lat);
    // console.log('handleLocationSelect long', long);
    setFormData(prevData => ({
      ...prevData,
      lat,
      long,
    }));
  };
  const handleSubmit = async () => {
    let validationError = validate('name', formData.name);
    if (validationError) {
      setError(prev => ({ ...prev, name: validationError }));
      setCurrentPage(0);
      return;
    }
    validationError = validate('dob', formData.dob);
    if (validationError) {
      setError(prev => ({ ...prev, dob: validationError }));
      setCurrentPage(1);
      return;
    }
    // const submitData = {
    //   name: formData.name,
    //   dob: formData.dob,
    //   time: formData.time,
    //   place: formData.place,
    //   lat: formData.lat === '' ? '27.1767' : formData.lat,
    //   long: formData.long === '' ? '78.0081' : formData.long,
    //   gender: formData.gender,
    //   timezone: formData.timezone,
    //   ...(onBoardType == 'SocialLogin' ? { phone: formData.phone , country_code: formData.country_code } : {})
    // };

    const submitData = {
      name: formData.name.trim(),
      date_of_birth: moment(formData.dob).format('YYYY-MM-DD'),
      time_of_birth: moment(formData.time).format('HH:mm:ss'),
      place_of_birth: formData.place || '',
      lat: formData.lat || '',
      long: formData.long || '',
      gender: formData.gender || '',
      timezone: formData.timezone || '',
      ...(onBoardType == OnBoardType.socialLogin ? { phone: formData.phone , country_code: formData.country_code } : {})
    }
    console.log('submitData => ', submitData);
    const result =
      (onBoardType === OnBoardType.addUser || onBoardType === OnBoardType.combatUser)
        ? await addUserDetail(submitData)
        : await completeOnboarding(submitData);
    if (result.success) {
      // console.log('onBoardType => ', onBoardType);
      ToastMessage(i18n.t('toast.profileCompletedSuccess'));
      // console.log('new profile data : ', result);
      // setSelectedUser(result?.data as UserDetails);

      if (onBoardType === OnBoardType.combatUser) {
        if (props.route?.params?.onGoBack) {
          props.route?.params?.onGoBack();
        }
        props.navigation.goBack();
      } else if (onBoardType === OnBoardType.addUser) {
        setTimeout(() => {
          props.navigation.reset({
            index: 0,
            routes: [{ name: 'AppNavigator' }],
          });
          useAuthStore.setState({ isGetBonus: onBoardType === OnBoardType.newUser ? true : false });
        }, 500);
        // getUserDetail();
      }
    }
  };
  const isNextDisabled = () => {
    // console.log('currentPage => ', currentPage); 
    if (isLoading) return true;
    // if (currentPage === (notSocialLogin ? 0 : 1)) return !formData.phone.trim();
    // if (currentPage === (notSocialLogin ? 1 : 2)) return !formData.name.trim();
    // if (currentPage === (notSocialLogin ? 2 : 3)) return !formData.dob;
    // if (currentPage === (notSocialLogin ? 4 : 5)) return !formData.place.trim() || !formData.lat || !formData.long;

    return false;
  };
  const renderStep = () => {
    switch (currentPage) {
      case 0:
        return (
          <EnterPhoneStep
            value={formData.phone}
            onChangeText={text => setFormData({ ...formData, phone: text })}
            error={error}
          />
        );
      case 1:
        return (
          <EnterNameStep
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            error={error}
          />
        );
      case 2:
        return (
          <EnterDOBStep
            value={formData.dob}
            onChangeDate={date => setFormData({ ...formData, dob: date })}
            error={error}
          />
        );
      case 3:
        return (
          <EnterTimeStep
            value={formData.time}
            onChangeTime={time => setFormData({ ...formData, time: time })}
            // onChangeTimezone={(timezone: any) => {
            //   console.log('onChangeTimezone => ', timezone);
            //   setFormData({ ...formData, timezone: timezone?.value || '' })
            // }}
            error={error}
          />
        );
      case 4:
        return (
          <EnterPlaceStep
            value={formData.place}
            lat={formData.lat}
            long={formData.long}
            onChangeText={text => setFormData({ ...formData, place: text })}
            onChangeTimezone={(timezone: any) => {
              console.log('onChangeTimezone => ', timezone);
              setFormData({ ...formData, timezone: timezone?.value || '' })
            }}
            onLocationSelect={handleLocationSelect}
            onLocationTypeSelect={setLocationType}
            locationType={locationType}
            error={error}
          />
        );
      case 5:
        return (
          <GenderStep
            value={formData.gender}
            onSelect={gender => setFormData({ ...formData, gender })}
            isActive={true}
          />
        );
      default:
        return null;
    }
  };
  return (
    <BaseView contentContainerStyle={styles.baseView}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 60}
      >
        <View style={styles.headerView}>
          <BackArrow onPress={handleBack} />
          <Text style={styles.headerText}>
            {i18n.t(STEPS[notSocialLogin ? currentPage - 1 : currentPage].title)}
          </Text>
        </View>
        <ProgressBar completedSegments={notSocialLogin ? currentPage : currentPage + 1} totalSegments={STEPS.length} />
        {renderStep()}
        <CustomButton
          title={
            currentPage === STEPS.length - 1
              ? i18n.t('gender.submit')
              : i18n.t('name.next')
          }
          style={{ marginVertical: verticalScale(20) }}
          onPress={handleNext}
        disabled={isNextDisabled()}
        />
      </KeyboardAvoidingView>
      {isLoading && <Loader />}
    </BaseView>
  );
}
const styles = StyleSheet.create({
  baseView: {
    paddingHorizontal: scale(16),
  },
  container: {
    flex: 1,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginVertical: verticalScale(16),
  },
  headerText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(22),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});