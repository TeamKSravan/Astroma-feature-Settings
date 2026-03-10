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
const STEPS = [
  { title: 'name.name', key: 'name' },
  { title: 'time.date', key: 'date' },
  { title: 'time.time', key: 'time' },
  { title: 'place.place', key: 'place' },
  { title: 'gender.gender', key: 'gender' },
];
export default function OnboardingScreen(props: any) {
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState({});
  const { onBoardType = 'newUser' } = props.route?.params || {};
  console.log('onBoardType => ', onBoardType);
  const { completeOnboarding, isLoading, setIsGetBonus } = useAuthStore();
  const { addUserDetail, selectedUser, setSelectedUser, } = useProfileStore();
  const { validate } = useValidation();
  const [locationType, setLocationType] = useState<string>('automatic');
  const currentTimeZone = moment.tz.guess()
  const [formData, setFormData] = useState({
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
    console.log(`formData ${currentPage+1}: `, formData);
    let validationError = validate('name', formData.name);
    if (currentPage === 0 && validationError) {
      setError(prev => ({ ...prev, name: validationError }));
      return;
    }
    validationError = validate('dob', formData.dob);
    if (currentPage === 1 && validationError) {
      ToastMessage(validationError);
      return;
    }

    validationError = validate('place', formData.place);
    if (currentPage === 3 && validationError) {
      setError(prev => ({ ...prev, place: validationError }));
      return;
    }

    console.log('STEPS.length : ', STEPS.length);
    console.log('currentPage : ', currentPage);

    if (currentPage < STEPS.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleSubmit();
    }
  };
  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      props.navigation.goBack();
    }
  };
  const handleLocationSelect = (lat: string, long: string) => {
    console.log('handleLocationSelect lat', lat);
    console.log('handleLocationSelect long', long);
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
    const submitData = {
      name: formData.name,
      dob: formData.dob,
      time: formData.time,
      place: formData.place,
      lat: formData.lat === '' ? '27.1767' : formData.lat,
      long: formData.long === '' ? '78.0081' : formData.long,
      gender: formData.gender,
      timezone: formData.timezone
    };
    console.log('submitData => ', submitData);
    const result =
      (onBoardType === 'addUser' || onBoardType === 'combatUser')
        ? await addUserDetail(submitData)
        : await completeOnboarding(submitData);
    if (result.success) {
      console.log('onBoardType => ', onBoardType);
      ToastMessage('Profile completed successfully!');
      console.log('new profile data : ', result);
      // setSelectedUser(result?.data as UserDetails);

      if (onBoardType === 'combatUser') {
        props.navigation.goBack();
      } else if (onBoardType === 'addUser') {
        setTimeout(() => {
          props.navigation.reset({
            index: 0,
            routes: [{ name: 'AppNavigator' }],
          });
          useAuthStore.setState({ isGetBonus: onBoardType === 'newUser' ? true : false });
        }, 500);
        // getUserDetail();
      }
    } else {
      ToastMessage(
        result.message || 'Failed to complete onboarding. Please try again.',
      );
    }
  };
  const isNextDisabled = () => {
    if (isLoading) return true;
    if (currentPage === 0) return !formData.name.trim();
    if (currentPage === 1) return !formData.dob;
    if (currentPage === 3) return !formData.place.trim() || !formData.lat || !formData.long;

    return false;
  };
  const renderStep = () => {
    switch (currentPage) {
      case 0:
        return (
          <EnterNameStep
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            isActive={true}
          />
        );
      case 1:
        return (
          <EnterDOBStep
            value={formData.dob}
            onChangeDate={date => setFormData({ ...formData, dob: date })}
            isActive={true}
          />
        );
      case 2:
        return (
          <EnterTimeStep
            value={formData.time}
            onChangeTime={time => setFormData({ ...formData, time: time })}
            onChangeTimezone={(timezone: any) => {
              console.log('onChangeTimezone => ', timezone);
              setFormData({ ...formData, timezone: timezone?.value || '' })
            }}
            isActive={true}
          />
        );
      case 3:
        return (
          <EnterPlaceStep
            value={formData.place}
            lat={formData.lat}
            long={formData.long}
            onChangeText={text => setFormData({ ...formData, place: text })}
            onLocationSelect={handleLocationSelect}
            onLocationTypeSelect={setLocationType}
            locationType={locationType}
            isActive={true}
          />
        );
      case 4:
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 58 : 60}
      >
        <View style={styles.headerView}>
          <BackArrow onPress={handleBack} />
          <Text style={styles.headerText}>
            {i18n.t(STEPS[currentPage].title)}
          </Text>
        </View>
        <ProgressBar completedSegments={currentPage + 1} totalSegments={5} />
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