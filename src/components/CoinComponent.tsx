import { StyleSheet, Text, View } from 'react-native';
import React, { memo, useEffect } from 'react';
import { Coin } from '../constants/svgpath';
import { colors } from '../constants/colors';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import { useWalletStore } from '../store/useWalletStore';
import { formatNumberWithCommas } from '../utils/methods';

function CoinComponent() {
  const availableCoins = useWalletStore(state => state.availableCoins);

  useEffect(() => {
    void useWalletStore.getState().getWalletDetails({ silent: true });
  }, []);

  return (
    <View style={styles.pinkView}>
      <Coin />
      <Text style={styles.coinText}>{formatNumberWithCommas(availableCoins)}</Text>
    </View>
  );
}

export default memo(CoinComponent);

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
    width: scale(55),
  },
  coinText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(10),
  },
});
