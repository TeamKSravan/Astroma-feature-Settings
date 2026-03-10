import { Image, StyleSheet, Text, View, Dimensions, Modal } from 'react-native';
import React from 'react';
import imagepath from '../constants/imagepath';
import LottieView from 'lottie-react-native';

export default function Loader() {
  return (
    <Modal visible transparent>
      <View style={styles.mainView}>
        <LottieView
          style={styles.image}
          source={imagepath.loaderJson}
          autoPlay
          loop
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    zIndex: 9999,
  },
  image: {
    height: 45,
    width: 45,
  },
});
