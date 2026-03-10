import { Image, StyleSheet, View, Animated, ScrollView } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { BackArrow, Rashi1 } from '../../../constants/svgpath';
import i18n from '../../../translation/i18n';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { colors } from '../../../constants/colors';
import { fonts, height } from '../../../constants/fonts';
import CustomTextInput from '../../../components/CustomTextInput';
import imagepath from '../../../constants/imagepath';

interface EnterNameStepProps {
  value: string;
  onChangeText: (text: string) => void;
  isActive: boolean;
}

export default function EnterNameStep({
  value,
  onChangeText,

  isActive,
}: EnterNameStepProps) {
  // Main image animation - start from smaller and transparent
  const rashiOpacity = useRef(new Animated.Value(0)).current;
  const rashiScale = useRef(new Animated.Value(0.7)).current; // Start smaller for more visible growth

  // 8 elements for nice circular distribution - start from smaller
  const element1 = useRef(new Animated.Value(0)).current; // top left
  const element2 = useRef(new Animated.Value(0)).current; // top
  const element3 = useRef(new Animated.Value(0)).current; // top right
  const element4 = useRef(new Animated.Value(0)).current; // right
  const element5 = useRef(new Animated.Value(0)).current; // bottom right
  const element6 = useRef(new Animated.Value(0)).current; // bottom
  const element7 = useRef(new Animated.Value(0)).current; // bottom left
  const element8 = useRef(new Animated.Value(0)).current; // left

  // Additional stars for left bottom area
  const extraElement1 = useRef(new Animated.Value(0)).current; // left bottom area - star
  const extraElement2 = useRef(new Animated.Value(0)).current; // left bottom area - sparkle
  const extraElement3 = useRef(new Animated.Value(0)).current; // left bottom area - star

  useEffect(() => {
    // Beautiful, slow fade-in and growth for Rashi image
    Animated.parallel([
      Animated.timing(rashiOpacity, {
        toValue: 1,
        duration: 2500, // Slower, more elegant fade-in
        useNativeDriver: true,
      }),
      Animated.timing(rashiScale, {
        toValue: 1,
        duration: 2500, // Slower, more graceful growth
        useNativeDriver: true,
      }),
    ]).start();
    startSparkleAnimations();
  }, []);

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
          duration: 1500, // Slower initial appearance
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Gentle pulsing loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1.25, // Slightly larger pulse
              duration: 3000, // Slower, more soothing pulse
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0.75, // Fade down more
              duration: 3000, // Slower, more soothing pulse
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });
    };

    // Stagger animations with longer delays for smoother, more elegant effect
    createSparkleAnimation(element1, 0);
    createSparkleAnimation(element2, 300);
    createSparkleAnimation(element3, 600);
    createSparkleAnimation(element4, 900);
    createSparkleAnimation(element5, 1200);
    createSparkleAnimation(element6, 1500);
    createSparkleAnimation(element7, 1800);
    createSparkleAnimation(element8, 2100);

    // Extra stars in left bottom area with staggered timing
    createSparkleAnimation(extraElement1, 2400);
    createSparkleAnimation(extraElement2, 2700);
    createSparkleAnimation(extraElement3, 3000);
  };

  const createElementStyle = (animValue: Animated.Value) => {
    const opacity = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.4, 1, 0.5], // More dramatic fade effect
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
    <ScrollView
      // style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <View style={styles.contentView}>
        <View style={{ alignSelf: 'center', position: 'relative' }}>
          {/* Main Rashi Image */}
          <Animated.View
            style={{
              opacity: rashiOpacity,
              transform: [{ scale: rashiScale }],
            }}
          >
            <Image source={imagepath.rashi1} />
          </Animated.View>

          {/* Top Left - Sparkle (outside image) */}
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

          {/* Top Right - Sparkle (outside image) */}
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

          {/* Right - Star (outside image) */}
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

          {/* Bottom Right - Sparkle (outside image) */}
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

          {/* Bottom Center - Star (below image) */}
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

          {/* Bottom Left - Sparkle (outside image) */}
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

          {/* Left - Star (outside image) */}
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

          {/* Extra Stars in Left Bottom Area */}
          {/* Star 1 - positioned between left and bottom-left */}
          {/* <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 35,
                  left: -30,
                },
                createElementStyle(extraElement1),
              ]}
            >
              <Image source={imagepath.star} style={{ width: 18, height: 18 }} />
            </Animated.View> */}

          {/* Sparkle 2 - positioned lower and more to the left */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 10,
                left: -40,
              },
              createElementStyle(extraElement2),
            ]}
          >
            <Image
              source={imagepath.sparkle}
              style={{ width: 14, height: 14 }}
            />
          </Animated.View>

          {/* Star 3 - positioned between bottom-left and left */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 60,
                left: -20,
              },
              createElementStyle(extraElement3),
            ]}
          >
            <Image source={imagepath.star} style={{ width: 16, height: 16 }} />
          </Animated.View>
        </View>
      </View>

      <CustomTextInput
        placeholder={i18n.t('name.name')}
        value={value}
        onChangeText={(txt) => onChangeText(txt.replace(/[^a-zA-Z\s]/g, '').slice(0, 40))}
        inputStyle={{ marginTop: verticalScale(40) }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    // flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  contentView: {
    marginTop: verticalScale(72),
    marginBottom: verticalScale(30),
    // minHeight: 250,
  },
  image: {
    alignSelf: 'center',
  },
});
