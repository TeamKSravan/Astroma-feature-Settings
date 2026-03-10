import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../constants/colors';
import i18n from '../translation/i18n';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';
import { Number, Pallete, Time } from '../constants/svgpath';

interface LuckySectionProps {
  luckyNumber?: string;
  luckySymbol?: string;
  luckyColorPrimary?: string;
  luckyColorSecondary?: string;
  luckyTime?: string;
  luckyTimeIcon?: string;
  style?: ViewStyle;
}

const LuckySection: React.FC<LuckySectionProps> = ({
  luckyNumber,
  luckySymbol,
  luckyColorPrimary,
  luckyColorSecondary,
  luckyTime,

  luckyTimeIcon,
  style,
}) => {
  // Memoize the color circle style to ensure it updates when luckyColorPrimary changes
  const colorCircleStyle = useMemo(() => [
    styles.colorCircle,
    { backgroundColor: luckyColorPrimary || colors.white },
  ], [luckyColorPrimary]);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#25237600', '#25237666']}
        style={[styles.card, styles.numberCard]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      >
        <View style={styles.contentView1}>
          <View style={styles.numberView}>
            <Text style={styles.numberText}>{luckyNumber}</Text>
            <Number />
          </View>
        </View>
        <Text style={styles.labelText}>{i18n.t('lucky.number')}</Text>
      </LinearGradient>

      <LinearGradient
        colors={['#543D0800', '#543D0866']}
        style={[styles.card, styles.colorCard]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      >
        <View style={styles.contentView}>
          <View style={styles.colorView}>
            <View style={colorCircleStyle} />
          </View>
          <Pallete />
        </View>
        <Text style={styles.labelText}>{i18n.t('lucky.color')}</Text>
      </LinearGradient>
      <LinearGradient
        colors={['#25237600', '#25237666']}
        style={[styles.card, styles.timeCard]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      >
        <View style={styles.contentView}>
          <View style={styles.timeView}>
            <Text style={styles.timeText}>{luckyTime}</Text>
            <Time />
          </View>
        </View>
        <Text style={styles.labelText}>{i18n.t('lucky.time')}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: verticalScale(20),
    gap: scale(6),
    flex: 1,
  },
  card: {
    flex: 1,
    borderWidth: 0.6,
    borderRadius: scale(8),
    height: verticalScale(100),
    justifyContent: 'space-between',
  },
  numberCard: {
    borderColor: colors.indigo,
  },
  colorCard: {
    borderColor: colors.brown,
  },
  timeCard: {
    borderColor: colors.blue,
  },
  contentView: {
    paddingHorizontal: scale(12),
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: verticalScale(4),
  },
  contentView1: {
    paddingHorizontal: scale(12),
    justifyContent: 'space-between',

    marginTop: verticalScale(4),
  },
  numberView: {
    flexDirection: 'row',
    gap: scale(4),
    justifyContent: 'space-between',
  },
  numberText: {
    color: colors.purple,
    fontFamily: fonts.bold,
    fontSize: moderateScale(24),
  },
  symbolText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(20),
    marginTop: verticalScale(4),
  },
  colorView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // gap: scale(16),
  },
  colorCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
  },
  paletteCircle: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
  },
  timeView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  timeText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(14),
  },
  iconText: {
    fontSize: moderateScale(28),
  },
  labelText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(10),
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
});

export default LuckySection;
