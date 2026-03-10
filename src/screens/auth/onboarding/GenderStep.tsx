import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import {
  Rashi1,
  Male,
  Female,
  Other,
  Rashi6,
} from '../../../constants/svgpath';

import { colors } from '../../../constants/colors';
import { fonts, height } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import i18n from '../../../translation/i18n';
import imagepath from '../../../constants/imagepath';

interface GenderStepProps {
  value: 'male' | 'female' | 'other' | null;
  onSelect: (gender: 'male' | 'female' | 'other') => void;
  isActive: boolean;
}

export default function GenderStep({
  value,
  onSelect,
  isActive,
}: GenderStepProps) {
  // ✅ Added: Track if animation has already run
  const hasAnimated = useRef(false);

  // Main image animation - start from smaller and transparent
  const rashiOpacity = useRef(new Animated.Value(0)).current;
  const rashiScale = useRef(new Animated.Value(0.7)).current;

  // 8 elements for circular distribution
  const element1 = useRef(new Animated.Value(0)).current; // top left
  const element2 = useRef(new Animated.Value(0)).current; // top
  const element3 = useRef(new Animated.Value(0)).current; // top right
  const element4 = useRef(new Animated.Value(0)).current; // right
  const element5 = useRef(new Animated.Value(0)).current; // bottom right
  const element6 = useRef(new Animated.Value(0)).current; // bottom
  const element7 = useRef(new Animated.Value(0)).current; // bottom left
  const element8 = useRef(new Animated.Value(0)).current; // left

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
    const createSparkleAnimation = (
      animValue: Animated.Value,
      delay: number,
    ) => {
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentView}>
        <View style={{ alignSelf: 'center', position: 'relative' }}>
          {/* Main Rashi Image */}
          <Animated.View
            style={{
              opacity: rashiOpacity,
              transform: [{ scale: rashiScale }],
            }}
          >
            <Image source={imagepath.rashi7} />
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

          {/* Bottom Right - Sparkle */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: -15,
                right: 15,
              },
              createElementStyle(element5),
            ]}
          >
            <Image
              source={imagepath.sparkle}
              style={{ width: 16, height: 16 }}
            />
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

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            value === 'male' && styles.genderButtonActive,
          ]}
          onPress={() => onSelect('male')}
        >
          <Text
            style={[
              styles.genderText,
              value === 'male' && styles.genderTextActive,
            ]}
          >
            {i18n.t('gender.male')}
          </Text>
          <Male />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            value === 'female' && styles.genderButtonActive,
          ]}
          onPress={() => onSelect('female')}
        >
          <Text
            style={[
              styles.genderText,
              value === 'female' && styles.genderTextActive,
            ]}
          >
            {i18n.t('gender.female')}
          </Text>
          <Female />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            value === 'other' && styles.genderButtonActive,
          ]}
          onPress={() => onSelect('other')}
        >
          <Text
            style={[
              styles.genderText,
              value === 'other' && styles.genderTextActive,
            ]}
          >
            {i18n.t('gender.other')}
          </Text>
          <Other />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentView: {
    marginTop: verticalScale(72),
    marginBottom: verticalScale(70),
  },
  image: {
    alignSelf: 'center',
  },
  genderContainer: {
    gap: verticalScale(9),
  },
  genderButton: {
    backgroundColor: colors.lightBlack,
    borderWidth: 0.2,
    borderColor: colors.primary,
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: verticalScale(8),
    height: verticalScale(45),
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(14),
  },
  genderTextActive: {
    fontFamily: fonts.semiBold,
  },
});
