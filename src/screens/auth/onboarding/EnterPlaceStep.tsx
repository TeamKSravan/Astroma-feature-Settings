import {
  Image,
  StyleSheet,
  View,
  Animated,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
  Keyboard,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import CustomTextInput from '../../../components/CustomTextInput';
import i18n from '../../../translation/i18n';
import { verticalScale } from '../../../utils/scale';
import imagepath from '../../../constants/imagepath';
import { colors } from '../../../constants/colors';
import { AstrologyApiKey } from '../../../constants/Keys';
import RadioSection from '../../../components/RadioSection';

interface EnterPlaceStepProps {
  value: string;
  lat: string;
  long: string;
  onChangeText: (text: string) => void;
  onLocationSelect: (lat: string, lng: string) => void;
  locationType: string;
  onLocationTypeSelect: (type: string) => void;
  isActive: boolean;
}

export default function EnterPlaceStep({
  value,
  lat,
  long,
  onChangeText,
  isActive,
  onLocationSelect,
  locationType,
  onLocationTypeSelect,
}: EnterPlaceStepProps) {
  const hasAnimated = useRef(false);
  const rashiOpacity = useRef(new Animated.Value(0)).current;
  const rashiScale = useRef(new Animated.Value(0.7)).current;
  const isSelectingRef = useRef<boolean>(false);
  const element1 = useRef(new Animated.Value(0)).current;
  const element2 = useRef(new Animated.Value(0)).current;
  const element3 = useRef(new Animated.Value(0)).current;
  const element4 = useRef(new Animated.Value(0)).current;
  const element5 = useRef(new Animated.Value(0)).current;
  const element6 = useRef(new Animated.Value(0)).current;
  const element7 = useRef(new Animated.Value(0)).current;
  const element8 = useRef(new Animated.Value(0)).current;

  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: string | null; lng: string | null }>({ lat: lat ?? '', lng: long ?? '' });
  const [selectedValue, setSelectedValue] = useState<string>('automatic');
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(()=>{
    onLocationSelect(coordinates.lat ?? '', coordinates.lng ?? '');
  },[coordinates])

  useEffect(() => {
    if (isActive && !hasAnimated.current) {
      hasAnimated.current = true;

      Animated.parallel([
        Animated.timing(rashiOpacity, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(rashiScale, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start();
      startSparkleAnimations();
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const startSparkleAnimations = () => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
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

    createAnimation(element1, 0);
    createAnimation(element2, 300);
    createAnimation(element3, 600);
    createAnimation(element4, 900);
    createAnimation(element5, 1200);
    createAnimation(element6, 1500);
    createAnimation(element7, 1800);
    createAnimation(element8, 2100);
  };

  const getSparkleStyle = (animValue: Animated.Value) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.4, 1, 0.5],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 0.75, 1, 1.25],
          outputRange: [0, 0.7, 1, 1.2],
        }),
      },
    ],
  });

  const handleInputChange = (text: string) => {
    // Filter special characters except comma and hyphen
    let filteredText = text.replace(/[^a-zA-Z0-9\s,\-]/g, '');

    // Remove leading commas and hyphens (first character must be alphabet or number)
    filteredText = filteredText.replace(/^[,\-\s]+/, '');

    if (isSelectingRef.current) {
      return;
    }
    onChangeText(filteredText);

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
      fetchPredictions(filteredText);
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
        console.log('json', json);
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

    onChangeText('');
    setPredictions([]);
    setShowDropdown(false);
    setCoordinates({ lat: null, lng: null });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const fetchPlaceDetails = async (item: any) => {
    isSelectingRef.current = true;
    Keyboard.dismiss();
    setShowDropdown(false);
    setPredictions([]);
    setCoordinates({
      lat: item.lat ?? '',
      lng: item.lon ?? '',
    });
    onChangeText(item.display_name ?? '');
    onLocationSelect(item.lat ?? '', item.lon ?? '');
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
      {/* <Text style={styles.dropdownText}>{item.place_name} ({item.country_code})</Text> */}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      scrollEnabled={true}
    >
      <View style={styles.contentView}>
        <View style={{ alignSelf: 'center', position: 'relative' }}>
          <Animated.View
            style={{
              opacity: rashiOpacity,
              transform: [{ scale: rashiScale }],
            }}
          >
            <Image source={imagepath.rashi3} />
          </Animated.View>

          <Animated.View
            style={[
              { position: 'absolute', top: -15, left: 15 },
              getSparkleStyle(element1),
            ]}
          >
            <Image source={imagepath.sparkle} style={styles.sparkle} />
          </Animated.View>

          <Animated.View
            style={[
              { position: 'absolute', top: -20, left: '50%', marginLeft: -10 },
              getSparkleStyle(element2),
            ]}
          >
            <Image source={imagepath.star} style={styles.star} />
          </Animated.View>

          <Animated.View
            style={[
              { position: 'absolute', top: -15, right: 15 },
              getSparkleStyle(element3),
            ]}
          >
            <Image source={imagepath.sparkle} style={styles.sparkle} />
          </Animated.View>

          <Animated.View
            style={[
              { position: 'absolute', top: '50%', right: -25, marginTop: -10 },
              getSparkleStyle(element4),
            ]}
          >
            <Image source={imagepath.star} style={styles.star} />
          </Animated.View>

          <Animated.View
            style={[
              { position: 'absolute', bottom: -15, right: 15 },
              getSparkleStyle(element5),
            ]}
          >
            <Image source={imagepath.sparkle} style={styles.sparkle} />
          </Animated.View>

          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: -20,
                left: '50%',
                marginLeft: -10,
              },
              getSparkleStyle(element6),
            ]}
          >
            <Image source={imagepath.star} style={styles.star} />
          </Animated.View>

          <Animated.View
            style={[
              { position: 'absolute', bottom: -15, left: 15 },
              getSparkleStyle(element7),
            ]}
          >
            <Image source={imagepath.sparkle} style={styles.sparkle} />
          </Animated.View>

          <Animated.View
            style={[
              { position: 'absolute', top: '50%', left: -25, marginTop: -10 },
              getSparkleStyle(element8),
            ]}
          >
            <Image source={imagepath.star} style={styles.star} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <RadioSection
          options={[{ label: i18n.t('place.automatic'), value: 'automatic' }, { label: i18n.t('place.manual'), value: 'manual' }]}
          selectedValue={locationType}
          // selectedValue={selectedValue}
          onSelect={(value)=>{
            // setSelectedValue(value);
            onLocationTypeSelect(value);
            setCoordinates({ lat: null, lng: null });
            onChangeText('');
            onLocationSelect('', '');
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }}
        />
        <View style={styles.inputWrapper}>
          <CustomTextInput
            ref={inputRef}
            placeholder={i18n.t('place.city')}
            value={value}
            onChangeText={handleInputChange}
            blurOnSubmit={false}
            returnKeyType="done"
          />

          {locationType === 'manual' && (
            <View style={styles.manualInputWrapper}>
              <CustomTextInput
                placeholder={i18n.t('place.enterLatitude')}
                value={coordinates.lat ?? ''}
                keyboardType="default"
                onChangeText={(text) => {
                  const sanitized = sanitizeLatInput(text);
                  const next = { ...coordinates, lat: sanitized };
                  setCoordinates(next);
                  onLocationSelect(latToNumeric(sanitized || null), lngToNumeric(next.lng));
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
                  onLocationSelect(latToNumeric(next.lat), lngToNumeric(sanitized || null));
                }}
              />
            </View>
          )}

          {value.length > 0 && locationType === 'automatic' && (
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
        {showDropdown && value.length >= 2 && locationType === 'automatic' && (
          <View style={styles.dropdownFixed}>
            {predictions.length > 0 ? (
              <FlatList
                data={predictions}
                renderItem={renderDropdownItem}
                keyExtractor={(item: any) => item.place_name}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentView: {
    marginTop: verticalScale(72),
    marginBottom: verticalScale(30),
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },
  sparkle: { width: 16, height: 16 },
  star: { width: 20, height: 20 },

  inputContainer: {
    marginTop: verticalScale(40),
  },

  inputWrapper: {
    position: 'relative',
  },

  clearButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -12,
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

  coordsContainer: {
    marginTop: 20,
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  coordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },

  coords: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  manualInputWrapper: {
    marginTop: 10,
    gap: 10,
  },
});
