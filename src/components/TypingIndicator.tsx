import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import i18n from '../translation/i18n';

interface TypingIndicatorProps {
  message?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  message,
}) => {
  const displayMessage = message ?? i18n.t('chat.consultingStars');
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
  }, []);

  const renderDot = (animValue: Animated.Value) => {
    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -8],
    });

    return (
      <Animated.View
        style={[
          styles.loadingDot,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingDots}>
        {renderDot(dot1Anim)}
        {renderDot(dot2Anim)}
        {renderDot(dot3Anim)}
      </View>
      <Text style={styles.loadingText}>{displayMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  loadingDots: {
    flexDirection: 'row',
    gap: scale(6),
    alignItems: 'center',
    height: scale(20),
  },
  loadingDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.primary,
  },
  loadingText: {
    fontSize: moderateScale(13),
    fontFamily: fonts.regular,
    color: colors.lightGray || '#CCCCCC',
    fontStyle: 'italic',
  },
});

export default TypingIndicator;
