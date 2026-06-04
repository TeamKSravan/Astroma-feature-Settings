import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale } from '../../utils/scale';

const OverviewLoader = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const dot1Animation = createDotAnimation(dot1Anim, 0);
    const dot2Animation = createDotAnimation(dot2Anim, 200);
    const dot3Animation = createDotAnimation(dot3Anim, 400);

    dot1Animation.start();
    dot2Animation.start();
    dot3Animation.start();

    return () => {
      dot1Animation.stop();
      dot2Animation.stop();
      dot3Animation.stop();
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const renderDot = (animValue: Animated.Value) => {
    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -6],
    });

    return (
      <Animated.View
        style={[
          styles.loader,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Generating Overview</Text>
      <View style={styles.loaderContainer}>
        {renderDot(dot1Anim)}
        {renderDot(dot2Anim)}
        {renderDot(dot3Anim)}
      </View>
    </View>
  );
};

export default OverviewLoader;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  text: {
    color: colors.gray,
    fontSize: moderateScale(12),
    fontFamily: fonts.semiBold,
  },
  loaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    height: 16,
  },
  loader: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
