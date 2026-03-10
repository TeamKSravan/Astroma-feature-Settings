import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { colors } from '../../../constants/colors';
import BaseView from '../../../utils/BaseView';
import imagepath from '../../../constants/imagepath';
import { Logo } from '../../../constants/svgpath';
import i18n from '../../../translation/i18n';
import CustomButton from '../../../components/CustomButton';
import { fonts } from '../../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
import { useAuthStore } from '../../../store/useAuthStore';
import LanguageModal from '../../../components/modals/LanguageModal';

export default function WelcomeScreen(props: any) {
  const { setHasSeenWelcome, currentLanguage } = useAuthStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleGetStarted = () => {
    console.log('Marking welcome screen as seen');
    setHasSeenWelcome(true);
    console.log('Navigating to LoginScreen');
    props.navigation.navigate('LoginScreen');
  };

  return (
    <BaseView backgroundImage={imagepath.imbg} resizeMode="cover">
      <View style={styles.mainView}>
        <Logo />
      </View>

      <Text style={styles.welcomeText}>{i18n.t('welcome.welcome')}</Text>
      <Text style={styles.yourText}>{i18n.t('welcome.your')}</Text>
      <Text style={styles.yourText}>{i18n.t('welcome.let')}</Text>
      <CustomButton
        style={{
          marginVertical: verticalScale(20),
          marginHorizontal: scale(20),
        }}
        title={i18n.t('welcome.get')}
        onPress={handleGetStarted}
      />
    </BaseView>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  welcomeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(30),
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  yourText: {
    color: colors.gray,
    fontFamily: fonts.bold,
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
});
