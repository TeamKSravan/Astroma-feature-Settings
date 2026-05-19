import React, { useState, useRef, useEffect, useCallback, useMemo, use } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Keyboard, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts, GOOGLE_API_KEY } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import CustomButton from '../CustomButton';
import i18n from '../../translation/i18n';
import CustomTextInput from '../CustomTextInput';
import CustomDropdown from '../CustomDropdown';
import { useProfileStore } from '../../store/useProfileStore';
import { AstrologyApiKey } from '../../constants/Keys';
import useValidation from '../../hooks/useValidation';
import CustomDateInput from '../CustomDateInput';
import moment from 'moment';
import { useNetInfo } from '@react-native-community/netinfo';
import { capitalizeFirstLetter } from '../../utils/methods';

type EditUserProfileProps = {
  userdata: any;
  closeModal: () => void;
  visible: boolean;
  reload?: () => void;
};


const ProfileInput = ({
  label,
  placeholder,
  value,
  forDate = false,
  onChangeText,
  dropdown = false,
  data = [],
  error = '',
  maxLength = 60,
}: {
  label: string,
  placeholder: string,
  value: string,
  forDate?: boolean,
  onChangeText: (text: string) => void,
  dropdown?: boolean,
  data?: any[],
  error?: string,
  maxLength?: number,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.labelText}>{label}</Text>
      {dropdown ? <CustomDropdown
        data={data || []}
        placeholder={placeholder}
        value={value}
        isModal={true}
        onChangeText={onChangeText}
        inputStyle={{
          height: verticalScale(55),
        }}
      /> :
        forDate ? <CustomDateInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          inputStyle={{
            height: verticalScale(50),
          }}
          error={error}
        /> :
          <CustomTextInput
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            onChangeText={onChangeText}
            inputStyle={{
              height: verticalScale(50),
            }}
            error={error}
          />
      }
    </View>
  )
}

export default function EditUserProfile(props: EditUserProfileProps) {
  const { isConnected, isInternetReachable } = useNetInfo()
  const [fullName, setFullName] = useState(props.userdata?.name || '');
  const [errors, setErrors] = useState({});
  const [gender, setGender] = useState(props.userdata?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(props.userdata?.date_of_birth || '');
  const [placeOfBirth, setPlaceOfBirth] = useState(props.userdata?.place_of_birth || '');
  const [latitude, setLatitude] = useState(props.userdata?.lat || '');
  const [longitude, setLongitude] = useState(props.userdata?.long || '');
  const [timeOfBirth, setTimeOfBirth] = useState(props.userdata?.time_of_birth || '');
  const { closeModal, visible } = props;
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const { validate } = useValidation();
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSelectingRef = useRef<boolean>(false);

  const { editUserDetail } = useProfileStore();

  useEffect(() => {
    setFullName(capitalizeFirstLetter(props.userdata?.name || ''));
    setGender(props.userdata?.gender || '');
    // setDateOfBirth(props.userdata?.date_of_birth || '');
    setDateOfBirth(props.userdata?.date_of_birth ? moment(props.userdata?.date_of_birth).format('DDMMYYYY') : '');
    setPlaceOfBirth(props.userdata?.place_of_birth || '');
    setTimeOfBirth(props.userdata?.time_of_birth || '');
    setLatitude(props.userdata?.lat || '');
    setLongitude(props.userdata?.long || '');
    setCoordinates({
      lat: props.userdata?.lat || '',
      lng: props.userdata?.long || '',
    });
    console.log('userdata : ', props.userdata);

  }, [props.userdata]);


  const saveChanges = () => {
    if (!isConnected || !isInternetReachable) {
      return Promise.reject(new Error(i18n.t('common.connectionError')));
    }


    let validationError = validate('name', fullName);
    console.log('name validationError : ', validationError);
    if (validationError) {
      setErrors(prev => ({ ...prev, name: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, name: '' }));
    }
    console.log('dateOfBirth : ', dateOfBirth);
    if (dateOfBirth == '' || dateOfBirth == null) {
      setErrors(prev => ({ ...prev, dateofbirth: i18n.t('profile.dateOfBirthRequired') }));
      return;
    } else {
      setErrors(prev => ({ ...prev, dateofbirth: '' }));
    }
    validationError = validate('time', timeOfBirth);
    console.log('timeOfBirth validationError : ', validationError);
    if (validationError) {
      setErrors(prev => ({ ...prev, time: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, time: '' }));
    }
    validationError = validate('place', placeOfBirth);
    console.log('place validationError : ', validationError);
    if (validationError) {
      setErrors(prev => ({ ...prev, place: validationError }));
      return;
    } else {
      setErrors(prev => ({ ...prev, place: '' }));
    }
    // validationError = validate('gender', gender);
    // console.log('gender validationError : ', validationError);
    // if (validationError) {
    //   setErrors(prev => ({ ...prev, gender: validationError }));
    //   return;
    // } else {
    //   setErrors(prev => ({ ...prev, gender: '' }));
    // }
    const updatedData = {
      id: props.userdata?._id?.$oid,
      name: capitalizeFirstLetter(fullName),
      date_of_birth: moment(dateOfBirth, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      place_of_birth: placeOfBirth,
      lat: coordinates.lat === '' ? '27.1767' : coordinates.lat,
      long: coordinates.lng === '' ? '78.0081' : coordinates.lng,
      time_of_birth: timeOfBirth,
      ...(gender ? { gender } : {}),
    };
    editUserDetail(updatedData).then((result) => {
      if (result.success) {
        console.log('Profile updated successfully');
        if (props.reload) {
          props.reload();
        }
        closeModal();
      } else {
        console.log('Failed to update profile:', result.message);
      }
    });
  }

  const handleInputChange = (text: string) => {
    // Don't process if we're in the middle of selecting an item
    if (isSelectingRef.current) {
      return;
    }
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
    // const url = `https://json.astrologyapi.com/v1/geo_details`;
    try {
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


  const onNameChange = (text: string) => {
    let capitalizeText = capitalizeFirstLetter(text);
    if(capitalizeText.length > 50) {
      setFullName(capitalizeText.slice(0, 50));
      setErrors(prev => ({ ...prev, name: i18n.t('profile.nameTooLong') }));
    } else {
      setFullName(capitalizeText);
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  /** Sanitize latitude input: allow digits, one minus, one dot, and optionally at end space + N or S (user types letter manually). Returns full string for display; use latToNumeric() for API. */
  const sanitizeLatInput = (text: string): string => {
    const trimmed = text.trim();
    const letterMatch = trimmed.match(/\s*[NS]$/i);
    const letterPart = letterMatch ? letterMatch[0] : '';
    let numStr = trimmed.slice(0, trimmed.length - letterPart.length).replace(/[^\d.-]/g, '');
    if (numStr.startsWith('-')) numStr = '-' + numStr.slice(1).replace(/-/g, '');
    else numStr = numStr.replace(/-/g, '');
    const parts = numStr.split('.');
    numStr = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('').replace(/\./g, '') : '');
    return numStr + letterPart;
  };

  /** Convert stored latitude string (e.g. "28.5 N" or "33.8688 S") to numeric string for API. */
  const latToNumeric = (lat: string | null): string => {
    if (lat === null || lat === '') return '';
    const upper = lat.trim().toUpperCase();
    const isS = upper.endsWith('S');
    const isN = upper.endsWith('N');
    const numStr = lat.replace(/[^\d.-]/g, '');
    const n = parseFloat(numStr);
    if (Number.isNaN(n)) return '';
    let val = n;
    if (isS) val = -Math.abs(n);
    else if (isN) val = Math.abs(n);
    val = Math.max(-90, Math.min(90, val));
    return String(val);
  };

  /** Sanitize longitude input: allow digits, one minus, one dot, and optionally at end space + E or W (user types letter manually). */
  const sanitizeLngInput = (text: string): string => {
    const trimmed = text.trim();
    const letterMatch = trimmed.match(/\s*[EW]$/i);
    const letterPart = letterMatch ? letterMatch[0] : '';
    let numStr = trimmed.slice(0, trimmed.length - letterPart.length).replace(/[^\d.-]/g, '');
    if (numStr.startsWith('-')) numStr = '-' + numStr.slice(1).replace(/-/g, '');
    else numStr = numStr.replace(/-/g, '');
    const parts = numStr.split('.');
    numStr = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('').replace(/\./g, '') : '');
    return numStr + letterPart;
  };

  /** Convert stored longitude string (e.g. "78.0081 E" or "122.4194 W") to numeric string for API. */
  const lngToNumeric = (lng: string | null): string => {
    if (lng === null || lng === '') return '';
    const upper = lng.trim().toUpperCase();
    const isW = upper.endsWith('W');
    const isE = upper.endsWith('E');
    const numStr = lng.replace(/[^\d.-]/g, '');
    const n = parseFloat(numStr);
    if (Number.isNaN(n)) return '';
    let val = n;
    if (isW) val = -Math.abs(n);
    else if (isE) val = Math.abs(n);
    val = Math.max(-180, Math.min(180, val));
    return String(val);
  };

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={closeModal}
      backdropOpacity={0.8}
      isVisible={visible}
    >
      <View style={styles.modalView}>
        <View style={styles.centeredView}>
          <Text style={styles.orderTitle}>{i18n.t('editUserProfile.title')}</Text>
        </View>
        <ScrollView bounces={false} >
          <ProfileInput label={i18n.t('profile.fullName')} placeholder={i18n.t('profile.fullName')} value={fullName} onChangeText={onNameChange} error={errors?.name} />
          <ProfileInput label={i18n.t('profile.dateOfBirth')} placeholder={i18n.t('profile.dateOfBirth')} value={dateOfBirth} onChangeText={setDateOfBirth} forDate={true} error={errors?.dateofbirth} />
          <ProfileInput label={i18n.t('profile.timeOfBirth')} placeholder={i18n.t('profile.timeOfBirth')} value={timeOfBirth} onChangeText={setTimeOfBirth} error={errors?.time} />
          <View style={styles.inputWrapper}>
            <ProfileInput label={i18n.t('profile.placeOfBirth')} placeholder={i18n.t('profile.placeOfBirth')} value={placeOfBirth} onChangeText={handleInputChange} error={errors?.place} />
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
          <View style={styles.manualInputWrapper}>
              <CustomTextInput
                placeholder={i18n.t('place.enterLatitude')}
                value={coordinates.lat ?? ''}
                keyboardType="default"
                onChangeText={(text) => {
                  const sanitized = sanitizeLatInput(text);
                  const next = { ...coordinates, lat: sanitized };
                  setCoordinates(next);   
                  setLatitude(sanitized);
                }}
              />
              <CustomTextInput
                placeholder={i18n.t('place.enterLongitude')}
                value={coordinates.lng ?? ''}
                keyboardType="default"
                onChangeText={(text) => {
                  const sanitized = sanitizeLngInput(text);
                  const next = { ...coordinates, lng: sanitized };
                  setCoordinates(next);
                  setLongitude(sanitized);
                }}
              />
            </View>
          <ProfileInput dropdown={true} data={[{ label: i18n.t('gender.male'), value: 'male' }, { label: i18n.t('gender.female'), value: 'female' }, { label: i18n.t('gender.other'), value: 'other' }]} label={i18n.t('profile.gender')} placeholder={i18n.t('profile.gender')} value={gender} onChangeText={setGender} error={errors?.gender} />
        </ScrollView>
        <CustomButton
          title={i18n.t('editUserProfile.saveChanges')}
          onPress={saveChanges}
          style={styles.buttonStyle}
          disabled={false}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: colors.modalbg,
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
  },
  container: {
    flex: 1,
    marginTop: verticalScale(40),
  },
  inputContainer: {
    flex: 1,
    gap: verticalScale(5),
    // height: verticalScale(75),
    marginTop: verticalScale(15),
    // backgroundColor: colors.red,
  },
  labelText: {
    fontSize: moderateScale(12),
    color: colors.white,
    fontFamily: fonts.regular,
  },
  centeredView: {
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(14),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 20,
  },
  orderLabel: {
    fontSize: scale(12),
    color: colors.gray,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: verticalScale(5),
  },
  orderLabel2: {
    fontSize: scale(12),
    color: colors.primary,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  buttonStyle: {
    marginTop: verticalScale(50),
  },
  otpInputWrapper: {
    width: scale(45),
    height: verticalScale(45),
    borderRadius: scale(12),
    borderWidth: 0.4,
    borderColor: colors.primary,
    backgroundColor: colors.lightBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: scale(20),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    padding: 0,
  },
  otpContainer: {
    flex: 1,
    paddingVertical: verticalScale(20),
  },
  otpInputContainer: {
    flex: 1,
    gap: verticalScale(10),
    // backgroundColor: colors.red,
  },
  timeLabel: {
    fontSize: scale(12),
    color: colors.white,
    fontFamily: fonts.regular,
    marginTop: verticalScale(5),
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
    marginTop: 2,
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
  manualInputWrapper: {
    gap: 10,
    marginTop: 20,
  },
});
