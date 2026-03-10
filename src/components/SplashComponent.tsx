import BaseView from '../utils/BaseView';
import { Image, StyleSheet, Text, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

import imagepath from '../constants/imagepath';
import { Line, Logo } from '../constants/svgpath';
import { verticalScale } from '../utils/scale';
import { height, width } from '../constants/fonts';

export default function SplashComponent() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
    ).start();

    // Pulsing scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Particle/shimmer effect
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const particleRotate = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const particleOpacity = particleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <BaseView backgroundImage={imagepath.imbg} resizeMode="cover">
      <View style={styles.mainView}>
        {/* Outermost ambient glow */}
        <Animated.View
          style={[
            styles.ambientGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Rotating particle ring */}
        <Animated.View
          style={[
            styles.particleRing,
            {
              opacity: particleOpacity,
              transform: [{ rotate: particleRotate }],
            },
          ]}
        >
          {[0, 60, 120, 180, 240, 300].map((angle, index) => (
            <View
              key={index}
              style={[
                styles.particle,
                {
                  transform: [
                    { rotate: `${angle}deg` },
                    { translateX: width * 0.45 },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Middle glow ring */}
        <Animated.View
          style={[
            styles.glowMiddle,
            {
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Main rotating chakra */}
        <Animated.Image
          source={imagepath.chakra}
          style={[
            styles.img,
            {
              transform: [{ rotate }, { scale: scaleAnim }],
            },
          ]}
        />

        {/* Inner radial glow */}
        <Animated.View
          style={[
            styles.glowInner,
            {
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Central bright point */}
        <Animated.View
          style={[
            styles.centerGlow,
            {
              opacity: glowAnim,
            },
          ]}
        />
      </View>
      <View style={styles.logoView}>
        <Logo />
        <Line />
      </View>
    </BaseView>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: width * 0.85,
    height: width * 0.85,
    resizeMode: 'contain',
    zIndex: 5,
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: 'rgba(218, 165, 32, 0.06)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  glowMiddle: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
  },
  glowInner: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
  centerGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 223, 0, 0.8)',
    shadowColor: '#FFDF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  particleRing: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    left: '50%',
    top: '50%',
    marginLeft: -3,
    marginTop: -3,
  },
  logoView: {
    alignItems: 'center',
    gap: verticalScale(10),
    marginBottom: verticalScale(10),
  },
});
