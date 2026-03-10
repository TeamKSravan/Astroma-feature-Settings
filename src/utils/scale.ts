import { Dimensions, PixelRatio } from 'react-native';

let { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Listen to orientation changes dynamically
Dimensions.addEventListener('change', () => {
  const { width, height } = Dimensions.get('window');
  screenWidth = width;
  screenHeight = height;
});

const width = Math.min(screenWidth, screenHeight);
const height = Math.max(screenWidth, screenHeight);

// Base dimensions (standard iPhone 11 / XR size)
const guidelineBaseWidth = width < height ? 375 : 812;
const guidelineBaseHeight = width < height ? 812 : 375;

// Aspect ratio logic
const aspectRatio = width / height;
const aspectCompare = aspectRatio / 2.1653333;

let scale1: (size: number) => number;

if (aspectCompare > 1) {
  const widthNew = height * (width < height ? 0.4618226600985 : 2.1653333);
  const aspect = widthNew / (width < height ? 375 : 812);
  scale1 = size => aspect * size;
} else {
  scale1 = size => (width / guidelineBaseWidth) * size;
}

export const scale = (size: number) => scale1(size);
export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor: number = 0.5) =>
  size + (scale(size) - size) * factor;
