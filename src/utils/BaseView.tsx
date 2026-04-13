import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ImageBackground,
  ImageSourcePropType,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { scale, verticalScale } from './scale';

interface BaseViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundImage?: ImageSourcePropType; // pass image here
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const BaseView: React.FC<BaseViewProps> = ({
  children,
  style,
  contentContainerStyle,
  backgroundImage,
  resizeMode = 'stretch',
}) => {
  if (backgroundImage) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={[styles.container, style]}
        resizeMode={resizeMode}
      >
        <StatusBar translucent backgroundColor="transparent" />
        <SafeAreaView style={[styles.content, contentContainerStyle]}>
          {children}
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    flex: 1,
    marginHorizontal: Platform.OS === 'ios' ? 0 : scale(5),
    marginVertical: Platform.OS === 'ios' ? 0 : verticalScale(15),
  },
});

export default BaseView;
