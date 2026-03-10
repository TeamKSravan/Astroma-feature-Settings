// import React, { useEffect } from 'react';
// import {
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   View,
//   ViewStyle,
//   TextStyle,
//   Dimensions,
// } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedProps,
//   withRepeat,
//   withTiming,
//   Easing,
// } from 'react-native-reanimated';
// import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
// import { colors } from '../constants/colors';
// import { fonts } from '../constants/fonts';

// const AnimatedPath = Animated.createAnimatedComponent(Path);

// interface CustomButtonProps {
//   title: string;
//   onPress: () => void;
//   style?: ViewStyle;
//   textStyle?: TextStyle;
// }

// const CustomButton: React.FC<CustomButtonProps> = ({
//   title,
//   onPress,
//   style,
//   textStyle,
// }) => {
//   const progress = useSharedValue(0);

//   // Button dimensions
//   const buttonWidth = Dimensions.get('window').width - 80;
//   const buttonHeight = 58;
//   const borderRadius = 16;
//   const strokeWidth = 4;

//   useEffect(() => {
//     progress.value = withRepeat(
//       withTiming(1, {
//         duration: 3000,
//         easing: Easing.linear,
//       }),
//       -1,
//       false,
//     );
//   }, []);

//   // Calculate the path perimeter (approximate)
//   const straightWidth = buttonWidth - 2 * borderRadius;
//   const straightHeight = buttonHeight - 2 * borderRadius;
//   const cornerLength = (Math.PI * borderRadius) / 2;
//   const totalPerimeter =
//     2 * straightWidth + 2 * straightHeight + 4 * cornerLength;

//   const animatedProps = useAnimatedProps(() => {
//     const animatedLength = progress.value * totalPerimeter;

//     return {
//       strokeDashoffset: totalPerimeter - animatedLength,
//     };
//   });

//   // Create the rounded rectangle path
//   const createRoundedRectPath = () => {
//     const w = buttonWidth;
//     const h = buttonHeight;
//     const r = borderRadius;

//     return `
//       M ${r} 0
//       L ${w - r} 0
//       Q ${w} 0 ${w} ${r}
//       L ${w} ${h - r}
//       Q ${w} ${h} ${w - r} ${h}
//       L ${r} ${h}
//       Q 0 ${h} 0 ${h - r}
//       L 0 ${r}
//       Q 0 0 ${r} 0
//       Z
//     `;
//   };

//   return (
//     <View style={[styles.container, { width: buttonWidth }, style]}>
//       {/* Button */}
//       <TouchableOpacity
//         style={[styles.button, { width: buttonWidth, height: buttonHeight }]}
//         onPress={onPress}
//         activeOpacity={0.8}
//       >
//         <Text style={[styles.text, textStyle]}>{title}</Text>
//       </TouchableOpacity>

//       <Svg
//         width={buttonWidth}
//         height={buttonHeight}
//         style={styles.svgContainer}
//         pointerEvents="none"
//       >
//         <Defs>
//           <LinearGradient
//             id="borderGradient"
//             x1="0"
//             y1="0"
//             x2={buttonWidth * 1.5}
//             y2="0"
//             gradientUnits="userSpaceOnUse"
//             spreadMethod="reflect"
//           >
//             <Stop offset="0" stopColor="#F7F7F7" />
//             <Stop offset="0.2" stopColor="#C10BD9" />
//             <Stop offset="0.4" stopColor="#4D00FF" />
//             <Stop offset="0.6" stopColor="#00B2FF" />
//             <Stop offset="0.8" stopColor="#C10BD9" />
//             <Stop offset="1" stopColor="#F7F7F7" />
//           </LinearGradient>
//         </Defs>

//         <AnimatedPath
//           d={createRoundedRectPath()}
//           stroke="url(#borderGradient)"
//           strokeWidth={strokeWidth}
//           fill="none"
//           strokeDasharray={totalPerimeter}
//           animatedProps={animatedProps}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </Svg>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'relative',
//     marginTop: 20,
//     alignSelf: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   svgContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     zIndex: 1,
//   },
//   button: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   text: {
//     color: colors.black,
//     fontFamily: fonts.semiBold,
//     fontSize: 16,
//   },
// });

// export default CustomButton;

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { moderateScale, scale, verticalScale } from '../utils/scale';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode | null;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  disabled,
  icon=null,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[styles.container, style]}
      disabled={disabled}
    >
      <LinearGradient
        colors={colors.gradient}
        start={{ x: -1, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={styles.innerButton}
          activeOpacity={1}
          disabled={disabled}
          onPress={onPress}
        >
          <Text style={[styles.text, textStyle]}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(16),
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  gradient: {
    borderRadius: moderateScale(16),
    padding: scale(2),
  },
  innerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(32),
    marginBottom: 3,
  },
  text: {
    color: colors.black,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(16),
  },
  iconContainer: {
    marginLeft: scale(10),
  },
});

export default CustomButton;
