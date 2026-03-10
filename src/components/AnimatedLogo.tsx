import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const AnimatedLogo = ({ imagepath, styles }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Scale with bounce
    scale.value = withSequence(
      withSpring(1.1, {
        damping: 8,
        stiffness: 100,
      }),
      withSpring(1, {
        damping: 12,
        stiffness: 150,
      }),
    );

    // Slide down
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <View style={styles.mainView}>
      <AnimatedImage
        source={imagepath.logo}
        style={[{ marginTop: 40 }, animatedStyle]}
      />
    </View>
  );
};

export default AnimatedLogo;

// If you need the styles
const defaultStyles = StyleSheet.create({
  mainView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
