import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { Coin } from '../constants/svgpath';
import { colors } from '../constants/colors';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import { useWalletStore } from '../store/useWalletStore';

export default function CoinComponent() {
  const { availableCoins, getWalletDetails } = useWalletStore();

  useEffect(() => {
    getAppWalletDetails();
  }, []);

  const getAppWalletDetails = async () => {
    await getWalletDetails();
  }
  return (
    <View style={styles.pinkView}>
      <Coin />
      <Text style={styles.coinText}>{availableCoins}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pinkView: {
    flexDirection: 'row',
    backgroundColor: colors.pink,
    paddingHorizontal: scale(10),
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    height: verticalScale(20),
  },
  coinText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(10),
  },
});
