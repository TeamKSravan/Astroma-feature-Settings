import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import ZodicSign, { Type } from './ZodicSign';

interface Profile {
  id: string;
  name: string;
  zodiac_sign: string;
}

interface CompatibilityProfilesProps {
  profiles: Profile[];
}

export default function CompatibilityProfiles({ profiles }: CompatibilityProfilesProps) {
  if (!profiles || profiles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {profiles.map((profile: Profile, profileIndex: number) => (
        <React.Fragment key={profile.id}>
          <View style={styles.profileItem}>
            <ZodicSign sign={profile.zodiac_sign} type={Type.svg} />
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
          {profileIndex < profiles.length - 1 && (
            <Text style={styles.separatorText}>|</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  profileName: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(12),
    marginVertical: verticalScale(6),
  },
  separatorText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(12),
    marginHorizontal: scale(2),
  },
});

