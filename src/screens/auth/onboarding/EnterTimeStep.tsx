import { Image, StyleSheet, View, Animated, TouchableOpacity, Text } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Rashi1, Rashi3 } from '../../../constants/svgpath';
import TimePicker from '../../../components/TimePicker';
import TimeZoneModal from '../../../components/modals/TimeZoneModal';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { fonts, height } from '../../../constants/fonts';
import imagepath from '../../../constants/imagepath';
import moment from 'moment-timezone';
import { colors } from '../../../constants/colors';

interface EnterTimeStepProps {
  value: Date;
  onChangeTime: (time: Date) => void;
  onChangeTimezone: (timezone: any) => void;
  isActive: boolean;
}

export default function EnterTimeStep({
  value,
  onChangeTimezone,
  onChangeTime,
  isActive,
}: EnterTimeStepProps) {
  // ✅ Added: Track if animation has already run
  const hasAnimated = useRef(false);
  const currentTimeZone = { label: moment.tz.guess(), value: moment.tz.guess() };
  const [timezone, setTimezone] = useState(currentTimeZone);
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false);
  // Main image animation - start from smaller and transparent
  const rashiOpacity = useRef(new Animated.Value(0)).current;
  const rashiScale = useRef(new Animated.Value(0.7)).current;

  // 8 elements for circular distribution around the scorpion
  const element1 = useRef(new Animated.Value(0)).current; // top left
  const element2 = useRef(new Animated.Value(0)).current; // top
  const element3 = useRef(new Animated.Value(0)).current; // top right
  const element4 = useRef(new Animated.Value(0)).current; // right
  const element5 = useRef(new Animated.Value(0)).current; // bottom right
  const element6 = useRef(new Animated.Value(0)).current; // bottom
  const element7 = useRef(new Animated.Value(0)).current; // bottom left
  const element8 = useRef(new Animated.Value(0)).current; // left


  const handleTimezoneSelect = (timezone: any) => {
    setTimezone(timezone);
    onChangeTimezone(timezone);
  };
  useEffect(() => {
    // ✅ Fixed: Only start animation when isActive is true and hasn't animated yet
    if (isActive && !hasAnimated.current) {
      hasAnimated.current = true;

      // Beautiful, slow fade-in and growth for Rashi image
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
  }, [isActive]); // ✅ Depend on isActive

  const startSparkleAnimations = () => {
    // Create slow, beautiful sparkle animation with fade-in and growth
    const createSparkleAnimation = (
      animValue: Animated.Value,
      delay: number,
    ) => {
      Animated.sequence([
        Animated.delay(delay),
        // Initial fade-in and growth
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Gentle pulsing loop
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

    // Stagger animations with longer delays for smoother effect
    createSparkleAnimation(element1, 0);
    createSparkleAnimation(element2, 300);
    createSparkleAnimation(element3, 600);
    createSparkleAnimation(element4, 900);
    createSparkleAnimation(element5, 1200);
    createSparkleAnimation(element6, 1500);
    createSparkleAnimation(element7, 1800);
    createSparkleAnimation(element8, 2100);
  };

  const createElementStyle = (animValue: Animated.Value) => {
    const opacity = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.4, 1, 0.5],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.7, 1, 1.2],
    });

    return {
      opacity,
      transform: [{ scale }],
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentView}>
        <View style={{ alignSelf: 'center', position: 'relative' }}>
          {/* Main Rashi Image */}
          <Animated.View
            style={{
              opacity: rashiOpacity,
              transform: [{ scale: rashiScale }],
            }}
          >
            <Image source={imagepath.rashi8} />
          </Animated.View>

          {/* Top Left - Sparkle */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -15,
                left: 15,
              },
              createElementStyle(element1),
            ]}
          >
            <Image
              source={imagepath.sparkle}
              style={{ width: 16, height: 16 }}
            />
          </Animated.View>

          {/* Top Center - Star */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -20,
                left: '50%',
                marginLeft: -10,
              },
              createElementStyle(element2),
            ]}
          >
            <Image source={imagepath.star} style={{ width: 20, height: 20 }} />
          </Animated.View>

          {/* Top Right - Sparkle */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -15,
                right: 15,
              },
              createElementStyle(element3),
            ]}
          >
            <Image
              source={imagepath.sparkle}
              style={{ width: 16, height: 16 }}
            />
          </Animated.View>

          {/* Right - Star */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: '50%',
                right: -25,
                marginTop: -10,
              },
              createElementStyle(element4),
            ]}
          >
            <Image source={imagepath.star} style={{ width: 20, height: 20 }} />
          </Animated.View>

          {/* Bottom Center - Star */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: -20,
                left: '50%',
                marginLeft: -10,
              },
              createElementStyle(element6),
            ]}
          >
            <Image source={imagepath.star} style={{ width: 20, height: 20 }} />
          </Animated.View>

          {/* Bottom Left - Sparkle */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: -15,
                left: 15,
              },
              createElementStyle(element7),
            ]}
          >
            <Image
              source={imagepath.sparkle}
              style={{ width: 16, height: 16 }}
            />
          </Animated.View>

          {/* Left - Star */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: '50%',
                left: -25,
                marginTop: -10,
              },
              createElementStyle(element8),
            ]}
          >
            <Image source={imagepath.star} style={{ width: 20, height: 20 }} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.TimezoneContainer}>
          <Text style={styles.TimezoneTitle}>Timezone</Text>
          <TouchableOpacity style={styles.changeTimezoneButton} onPress={() => setShowTimeZoneModal(true)}>
            <Text style={styles.changeTimezoneText}>{timezone?.label ?? timezone}</Text>
          </TouchableOpacity>
        </View>
        <TimeZoneModal visible={showTimeZoneModal} closeModal={() => setShowTimeZoneModal(false)} value={timezone?.value} onTimezoneSelect={handleTimezoneSelect} />
        <TimePicker value={value} onChange={onChangeTime} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentView: {
    marginTop: verticalScale(72),
    marginBottom: verticalScale(20),
  },
  image: {
    alignSelf: 'center',
  },
  pickerContainer: {},
  TimezoneContainer: {
    alignSelf: 'center',
    width: '80%',
    marginTop: verticalScale(10),
    // backgroundColor: colors.lightBlack,
    // paddingVertical: verticalScale(15),
    // paddingHorizontal: scale(20),
    // borderRadius: moderateScale(12),

  },
  changeTimezoneButton: {
    alignSelf: 'center',
    width: '100%',
    marginTop: verticalScale(10),
    backgroundColor: colors.lightBlack,
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(12),

  },
  TimezoneTitle: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(12),
    textAlign: 'left',
    // marginBottom: verticalScale(10),
  },
  changeTimezoneText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: moderateScale(15),
    textAlign: 'center',
    // marginBottom: verticalScale(10),
  },
});
