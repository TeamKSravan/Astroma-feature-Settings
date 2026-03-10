import React, { use, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BaseView from '../../../../../utils/BaseView';
import imagepath from '../../../../../constants/imagepath';

import {
  moderateScale,
  scale,
  verticalScale,
} from '../../../../../utils/scale';
import { fonts, GOOGLE_API_KEY } from '../../../../../constants/fonts';
import { colors } from '../../../../../constants/colors';
import i18n from '../../../../../translation/i18n';
import CustomTextInput from '../../../../../components/CustomTextInput';
import CustomDropdown from '../../../../../components/CustomDropdown';
import DeleteUserModal from '../../../../../components/modals/DeleteUserModal';
import OTPVerification from '../../../../../components/modals/OTPVerification';
import CustomButton from '../../../../../components/CustomButton';
import CountryCodePicker from '../../../../../components/CountryCodePicker';
import { ToastMessage } from '../../../../../components/ToastMessage';
import useValidation from '../../../../../hooks/useValidation';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { Country, getAllCountries } from 'react-native-country-picker-modal';
import {
  BackButton,
  DeleteRed,
  ModalClose,
} from '../../../../../constants/svgpath';
import { useProfileStore } from '../../../../../store/useProfileStore';
import Loader from '../../../../../components/Loader';
import DateInput from '../../../../../components/CustomDateInput';
import CustomDateInput from '../../../../../components/CustomDateInput';
import { AstrologyApiKey } from '../../../../../constants/Keys';
import moment from 'moment';

const ProfileInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  editable = false,
  rightComponent = null,
  data = [],
  dropdown = false,
  forPhone = false,
  forDate = false,
  phoneNo = '',
  setPhoneNo = () => { },
  handleCountrySelect = () => { },
  selectedCountry = null as Country | null,
  error = '',
}: {
  label: string,
  placeholder: string,
  value: string,
  onChangeText: (text: string) => void,
  editable?: boolean,
  rightComponent?: React.ReactNode,
  data?: any[],
  dropdown?: boolean,
  forPhone?: boolean,
  forDate?: boolean,
  phoneNo?: string,
  setPhoneNo?: (text: string) => void,
  handleCountrySelect?: (country: Country) => void,
  selectedCountry?: Country | null,
  error?: string,
}) => {
  return (
    <View style={[styles.inputContainer,]}>
      <Text style={styles.labelText}>{label}</Text>
      {dropdown ? <CustomDropdown
        data={data || []}
        placeholder={placeholder}
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        inputStyle={{
          height: verticalScale(50),
        }}
        isModal={true}
      /> :
        forPhone ? <CustomTextInput
          placeholder={placeholder}
          value={phoneNo}
          onChangeText={setPhoneNo}
          keyboardType="phone-pad"
          maxLength={10}
          editable={editable}
          leftComponent={
            <CountryCodePicker
              editable={editable}
              onSelect={handleCountrySelect}
              selectedCountry={selectedCountry}
            />
          }
          rightComponent={editable ? rightComponent : <></>}
          error={error}
        /> :
          forDate ? <CustomDateInput
            placeholder={placeholder}
            value={value}
            editable={editable}
            onChangeText={onChangeText}
            inputStyle={{
              height: verticalScale(50),
            }}
            rightComponent={editable ? rightComponent : <></>}
            error={error}
          /> :
            <CustomTextInput
              placeholder={placeholder}
              value={value}
              editable={editable}
              onChangeText={onChangeText}
              inputStyle={{
                height: verticalScale(50),
              }}
              rightComponent={editable ? rightComponent : <></>}
              error={error}
            />
      }
    </View>
  )
}



export default function Profile({ navigation }: any) {
  const [errors, setErrors] = useState({});
  const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });

  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSelectingRef = useRef<boolean>(false);
  const { validate } = useValidation();
  const { sendOTP, isLoading, userDetails, deleteAccount, logout } = useAuthStore();
  const { getUserDetail, getPrimaryUserDetail, editPrimaryUserDetail } = useProfileStore();

  const getCountryCodeFromCallingCode = async callingCode => {
    const countries = await getAllCountries();
    console.log('country code ==>> ', callingCode)
    const country = countries.find(c =>
      c.callingCode?.includes(callingCode.replace('+', '')),
    );
    console.log('country object ==>> ', country)
    return country ?? null; // ISO code (IN, US, etc.)
  };

  useEffect(() => {
    console.log('userDetails : ', userDetails);
    setFullName(userDetails?.name || '');
    // Note: country_code is stored as string; resolve async to get Country then set state
    getCountryCodeFromCallingCode(userDetails?.country_code?.replace('+', '')).then(country =>
      setSelectedCountry(country),
    );
    setPhoneNo(userDetails?.phone || '');
    // CustomDateInput expects digits in DDMMYYYY format (it will display as DD/MM/YYYY)
    setDateOfBirth(userDetails?.dateOfBirth ? moment(userDetails.dateOfBirth).format('DDMMYYYY') : '');
    setPlaceOfBirth(userDetails?.place || '');
    // Format timeOfBirth as HH:mm using moment
    setTimeOfBirth(userDetails?.timeOfBirth ? moment(userDetails.timeOfBirth, ['HH:mm:ss', 'HH:mm', 'h:mm A']).format('HH:mm') : '');
    setGender(userDetails?.gender || '');
  }, []);

  useEffect(() => {

    fetchUserDetail();
  }, []);

  const fetchUserDetail = async () => {
    console.log('userDetails?.id  : ', userDetails?.id);
    console.log('userDetails : ', userDetails);
    const result = await getPrimaryUserDetail();
    console.log('User data : ', result);
  };

  const deleteUserAccount = () => {
    console.log('deleteUserAccount');
    deleteAccount().then((result) => {
      console.log('deleteUserAccount', result);
      if (result.success) {
        ToastMessage(result.message);
        logout();
      } else {
        ToastMessage(result.message || i18n.t('profile.deleteFailed'));
      }
    });
  }
  const saveChanges = () => {
    console.log('fullName : ', fullName);
    console.log('dateOfBirth : ', dateOfBirth);
    console.log('placeOfBirth : ', placeOfBirth);
    console.log('timeOfBirth : ', timeOfBirth);
    console.log('gender : ', gender);
    console.log('selectedCountry : ', selectedCountry);

    let validationError = validate('name', fullName);
    if (validationError) {
      // ToastMessage(validationError);
      setErrors(prev => ({ ...prev, name: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, name: '' }));
    }
    validationError = validate('phone', phoneNo, {
      countryCode: selectedCountry?.cca2 || '',
      minLength: 7,
      maxLength: 15,
    });
    if (validationError) {
      // ToastMessage(validationError);
      setErrors(prev => ({ ...prev, phone: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
    validationError = validate('dateofbirth', dateOfBirth);
    if (validationError) {
      // ToastMessage(validationError);
      setErrors(prev => ({ ...prev, dateofbirth: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, dateofbirth: '' }));
    }
    validationError = validate('place', placeOfBirth);
    if (validationError) {
      // ToastMessage(validationError);
      setErrors(prev => ({ ...prev, place: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, place: '' }));
    }
    validationError = validate('time', timeOfBirth);
    if (validationError) {
      // ToastMessage(validationError);
      setErrors(prev => ({ ...prev, time: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, time: '' }));
    }
    validationError = validate('gender', gender);
    if (validationError) {
      // ToastMessage(validationError);
      setErrors(prev => ({ ...prev, gender: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, gender: '' }));
    }

    editPrimaryUserDetail({
      name: fullName,
      phone: phoneNo,
      country_code: selectedCountry?.callingCode?.[0] || userDetails?.country_code || '',
      date_of_birth: moment(dateOfBirth, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      place_of_birth: placeOfBirth,
      lat: coordinates.lat === '' ? '27.1767' : coordinates.lat,
      long: coordinates.lng === '' ? '78.0081' : coordinates.lng,
      time_of_birth: timeOfBirth ? moment(timeOfBirth, 'HH:mm').format('HH:mm') : '',
      gender: gender,
    }).then((result) => {
      console.log('editPrimaryUserDetail', result);
      if (result.success) {
        ToastMessage(result.message);
        // setFullName(result?.data?.name || '');
        // setPhoneNo(result?.data?.phone || '');
        // setDateOfBirth(result?.data?.dateOfBirth || '');
        // setPlaceOfBirth(result?.data?.place || '');
        // setTimeOfBirth(result?.data?.timeOfBirth || '');
        // setGender(result?.data?.gender || '');
        setIsEditable(false);
        navigation.goBack();
        setErrors({});
        fetchUserDetail();
      } else {
        ToastMessage(result.message || i18n.t('profile.updateFailed'));
      }
    });
  }
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    console.log('Selected country:', country);
    console.log('Calling code:', country.callingCode[0]);
    console.log('Country code:', country.cca2);
  };



  const handleInputChange = (text: string) => {
    if (isSelectingRef.current) {
      return;
    }

    // Allow only letters, numbers, spaces, and common place-name punctuation ( . , ' - )
    const filtered = text.replace(/[^a-zA-Z0-9\s.,'-]/g, '');

    setPlaceOfBirth(filtered);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // if (text.length < 2) {
    //   setPredictions([]);
    //   setShowDropdown(false);
    //   return;
    // }

    // Show dropdown immediately when user starts typing
    if (!showDropdown) {
      setShowDropdown(true);
    }

    debounceTimer.current = setTimeout(() => {
      fetchPredictions(text);
    }, 500);
  };

  const fetchPredictions = async (text: string) => {
    // const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    //   text,
    // )}&key=${GOOGLE_API_KEY}&types=(cities)`;
    // const url = `https://json.astrologyapi.com/v1/geo_details`;
    try {
      // const response = await fetch(url);
      // const json = await response.json();

      // if (json.status === 'OK' && json.predictions) {
      //   setPredictions(json.predictions);
      // } else {
      //   setPredictions([]);
      // }
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${text}&limit=10`, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `MyGeoApp/1.0 (contact: your-real-email@gmail.com)`,
        },
      });
      // const response = await fetch(url, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     place: text,
      //     maxRows: 10,
      //   }),
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Basic ${AstrologyApiKey}`,
      //   },
      // });
      if (response.ok) {
        const json = await response.json();
        setPredictions(json);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      setPredictions([]);
    }
  };

  const handleClearInput = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setPlaceOfBirth('');
    setPredictions([]);
    setShowDropdown(false);
    setCoordinates({ lat: null, lng: null });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const fetchPlaceDetails = async (item: any) => {
    // Set flag to prevent handleInputChange from interfering
    isSelectingRef.current = true;

    // Clear any pending debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    Keyboard.dismiss();
    const selectedPlace = item.display_name ?? '';
    setPlaceOfBirth(selectedPlace);
    setPredictions([]);
    setCoordinates({
      lat: item.lat ?? '',
      lng: item.lon ?? '',
    });
    setShowDropdown(false);

    // Blur the input to prevent any further text changes
    inputRef.current?.blur();

    // Reset the flag after a short delay to allow state updates to complete
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
    // Keyboard.dismiss();

    // setShowDropdown(false);
    // setPredictions([]);

    // const apiKey = 'AIzaSyB0FjlKAR4bnyS4M2Vs_BC-Rh-5ZW9bBGU';
    // const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

    // try {
    //   const response = await fetch(url);
    //   const json = await response.json();

    //   const location = json?.result?.geometry?.location;

    //   if (location) {
    //     setCoordinates({
    //       lat: location.lat,
    //       lng: location.lng,
    //     });
    //   }

    //   setPlaceOfBirth(description);
    // } catch (error) {
    //   // silent
    // }
  };

  const renderDropdownItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => fetchPlaceDetails(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.dropdownText}>{item.display_name}</Text>
    </TouchableOpacity>
  );


  return (
    <BaseView backgroundImage={imagepath.reportBg}>
      <View style={styles.headerView}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <BackButton />
        </TouchableOpacity>
        <View style={styles.helloView}>
          <Text style={styles.nameText}>{i18n.t(isEditable ? 'profile.editProfile' : 'profile.profile')}</Text>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.8} onPress={() => setIsEditable(!isEditable)}>
            {isEditable ? <ModalClose width={scale(40)} height={scale(40)} color={colors.white} style={{ position: 'absolute', right: 0 }} />
              : <Text style={styles.editText}>{i18n.t('profile.edit')}</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 60}
      >
        <ScrollView bounces={false} style={styles.container}>
          <View style={{
            paddingHorizontal: scale(10),
            gap: verticalScale(15),
          }}>
            <ProfileInput label={i18n.t('profile.fullName')} placeholder={i18n.t('profile.fullName')} value={fullName} onChangeText={setFullName} editable={isEditable} error={errors?.name} />
            <ProfileInput
              label={i18n.t('profile.phoneNo')}
              forPhone={true}
              placeholder={i18n.t('profile.phoneNo')}
              value={phoneNo}
              onChangeText={setPhoneNo}
              phoneNo={phoneNo}
              setPhoneNo={setPhoneNo}
              handleCountrySelect={handleCountrySelect}
              selectedCountry={selectedCountry}
              editable={isEditable}
              rightComponent={
                <TouchableOpacity activeOpacity={0.8} onPress={() => setShowVerifyModal(true)}>
                  <Text style={styles.verifyText}>{i18n.t('profile.verify')}</Text>
                </TouchableOpacity>
              }
              error={errors?.phone}
            />
            <ProfileInput
              label={i18n.t('profile.dateOfBirth')}
              placeholder={i18n.t('profile.dateOfBirth')}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              editable={isEditable}
              forDate={true}
              error={errors?.dateofbirth}
            />
            <View style={styles.inputWrapper}>
              <ProfileInput label={i18n.t('profile.placeOfBirth')} placeholder={i18n.t('profile.placeOfBirth')} value={placeOfBirth} onChangeText={handleInputChange} editable={isEditable} error={errors?.place} />
              {placeOfBirth.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearInput}
                  activeOpacity={0.6}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* FIXED HEIGHT DROPDOWN - ALWAYS SAME SIZE */}
            {showDropdown && placeOfBirth.length >= 2 && (
              <View style={styles.dropdownFixed}>
                {predictions.length > 0 ? (
                  <FlatList
                    data={predictions}
                    renderItem={renderDropdownItem}
                    keyExtractor={(item: any) => item.place_id}
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>{i18n.t('place.noCitiesFound')}</Text>
                  </View>
                )}
              </View>
            )}
            <ProfileInput label={i18n.t('profile.timeOfBirth')} placeholder={i18n.t('profile.timeOfBirth')} value={timeOfBirth} onChangeText={setTimeOfBirth} editable={isEditable} error={errors?.time} />
            <ProfileInput dropdown={true} data={[{ label: i18n.t('gender.male'), value: 'male' }, { label: i18n.t('gender.female'), value: 'female' }, { label: i18n.t('gender.other'), value: 'other' }]} label={i18n.t('profile.gender')} placeholder={i18n.t('profile.gender')} value={gender} onChangeText={setGender} editable={isEditable} error={errors?.gender} />
            {!isEditable && <TouchableOpacity style={styles.deleteAccountButton} activeOpacity={0.8} onPress={() => setShowDeleteModal(true)}>
              <DeleteRed width={scale(30)} height={scale(30)} color={colors.red400} />
              <Text style={styles.deleteAccountButtonText}>{i18n.t('profile.deleteAc')}</Text>
            </TouchableOpacity>}
            <DeleteUserModal closeModal={() => setShowDeleteModal(false)} visible={showDeleteModal} handleVerify={deleteUserAccount} />
            <OTPVerification closeModal={() => setShowVerifyModal(false)} visible={showVerifyModal} />
          </View>
          {isEditable && <CustomButton
            title={i18n.t('profile.saveChanges')}
            onPress={saveChanges}
            style={styles.saveChangesButton}
            disabled={!isEditable}
          />}
          {isLoading && <Loader />}
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: verticalScale(15),
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    gap: scale(10),
  },
  inputContainer: {
    flex: 1,
    gap: verticalScale(10),
    height: verticalScale(75),
    // backgroundColor: colors.red,
  },
  labelText: {
    fontSize: moderateScale(12),
    color: colors.white,
    fontFamily: fonts.regular,
  },
  helloView: {
    flex: 1,
    flexDirection: 'row',
  },
  nameText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(16),
  },
  editText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
  },
  editButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dataContainer: {
    flex: 1,
    gap: verticalScale(10),
    backgroundColor: colors.blur2,
    paddingVertical: verticalScale(10),
  },
  itemcontainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    // backgroundColor: colors.blur,
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(15),
    // marginBottom: verticalScale(8),
    // borderRadius: scale(16),
    gap: scale(10),
  },
  itemcontainerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingVertical: scale(15),
    // gap: scale(10),
  },
  divider: {
    width: '90%',
    height: scale(1),
    backgroundColor: colors.menuBorder,
  },
  profileImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(25),
    backgroundColor: colors.black,
  },
  profileInfoView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  userNameText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: scale(14),
  },
  profileEmailText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontStyle: 'italic',
    fontSize: scale(10),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: scale(10),
  },
  verifyText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
  },
  deleteAccountButtonIcon: {
    width: scale(20),
    height: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    backgroundColor: colors.blur2,
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    gap: scale(10),
    alignItems: 'center',
    marginTop: verticalScale(30),
    zIndex: -10,
  },
  deleteAccountButtonText: {
    color: colors.red400,
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
  },
  saveChangesButton: {
    marginTop: verticalScale(50),
    paddingHorizontal: scale(5),
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },

  dropdownText: {
    fontSize: 16,
    color: '#fff',
  },
  inputWrapper: {
    position: 'relative',
    height: verticalScale(80),
    // alignItems: 'center',
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyStateText: {
    fontSize: 14,
    color: '#bbb',
  },

  clearButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  clearButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // FIXED HEIGHT DROPDOWN - NO LAYOUT SHIFTS
  dropdownFixed: {
    backgroundColor: '#000',
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    height: 140, // FIXED HEIGHT - KEY TO PREVENT KEYBOARD DISMISS
    overflow: 'hidden',
  },

});
