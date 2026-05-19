import React from 'react';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import imagepath from '../constants/imagepath';
import CategorySign from '../components/CategorySign';
import { capitalizeFirstLetter } from '../utils/methods';
import LinearGradient from 'react-native-linear-gradient';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import CompatibilityProfiles from '../components/CompatibilityProfiles';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProfileStore } from '../store/useProfileStore';

interface CCReportItemProps {
    item: any;
    index: number;
    onPress: (item: any, index: number) => void;
}

export default function CCReportItem({ item, index, onPress }: CCReportItemProps) {
    const { secondaryUserdata } = useProfileStore();
    const profiles = secondaryUserdata?.map((user: any) => user.zodiac_sign);
    return (
        <TouchableOpacity style={styles.bgView} onPress={() => onPress(item, index)}>
            <Image source={imagepath.planetBg} resizeMode='contain' style={styles.imbg} />
            <View style={styles.compatView}>
                <CategorySign sign={item?.compatibility?.type} />
                <Text style={styles.compatText}>{` ${capitalizeFirstLetter(item?.compatibility?.type)} ${item?.is_comparison ? 'Compare' : 'Compatibility'}`}</Text>
            </View>
            <CompatibilityProfiles profiles={item?.profiles || []} />
            <View style={styles.purpleView}>
                <Text style={styles.purpleText}>{item?.compatibility?.type}</Text>
            </View>
            <View style={styles.descriptionGradient2}>
                <Text numberOfLines={4} style={styles.contextText}>{item?.compatibility?.prompt}</Text>
                <LinearGradient
                    colors={[colors.neutral950, 'transparent']}
                    start={{ x: 0, y: 0.7 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.descriptionGradient}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bgView: {
      backgroundColor: colors.neutral950,
      maxHeight: 170,
      padding: scale(15),
      marginBottom: verticalScale(14),
      borderRadius: scale(14),
      borderWidth: 0.2,
      borderColor: colors.white,
    },
    compatView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    compatText: {
      color: colors.white,
      fontFamily: fonts.bold,
      fontSize: moderateScale(20),
    },
    imbg: {
      alignSelf: 'flex-end',
      position: 'absolute',
    },
    purpleView: {
      backgroundColor: colors.darkPurple,
      flexDirection: 'row',
      alignSelf: 'flex-start',
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(6),
      borderRadius: scale(4),
      paddingVertical: verticalScale(2),
      paddingHorizontal: scale(10),
      marginTop: verticalScale(4),
    },
    purpleText: {
      color: colors.white,
      fontFamily: fonts.semiBold,
      fontSize: moderateScale(10),
    },
    contextText: {
      color: colors.lightGray,
      fontFamily: fonts.semiBold,
      fontSize: moderateScale(10),
      marginTop: verticalScale(10),
    },
    descriptionGradient: {
      position: 'absolute',
      height: scale(55),
      width: '100%',
    },
    descriptionGradient2: {
      height: scale(50),
    },
  });