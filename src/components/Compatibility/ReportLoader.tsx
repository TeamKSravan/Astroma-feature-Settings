import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Modal, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import imagepath from '../../constants/imagepath';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale } from '../../utils/scale';

const PROGRESS_BAR_WIDTH = scale(240);

const ReportLoader = () => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 22000,//progress time
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(progressAnim, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false,
                }),
            ]),
        );

        animation.start();

        return () => {
            animation.stop();
            progressAnim.setValue(0);
        };
    }, [progressAnim]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, PROGRESS_BAR_WIDTH],
    });

    return (
        <Modal visible transparent>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={imagepath.Flower} resizeMode="contain" style={styles.flower} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar6, styles.star1position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar2, styles.star2position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar5, styles.star3position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar4, styles.star4position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar3, styles.star5position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar4, styles.star6position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar4, styles.star7position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar3, styles.star8position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar1, styles.star9position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar3, styles.star10position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar4, styles.star11position]} />
                    <Image source={imagepath.FlowerStar} resizeMode="contain" style={[styles.flowerStar2, styles.star12position]} />

                    <View style={styles.centerContent}>
                        <Text style={styles.analysingText}>Analysing...</Text>
                        <View style={styles.progressTrack}>
                            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                                <LinearGradient
                                    colors={[
                                        'rgba(84, 61, 8, 0)',
                                        'rgba(204, 158, 73, 0.35)',
                                        colors.primary,
                                        colors.primarylight,
                                        '#FFF8DC',
                                        '#FFFFFF',
                                    ]}
                                    locations={[0, 0.25, 0.55, 0.78, 0.92, 1]}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={styles.progressGradient}
                                />
                            </Animated.View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        // paddingBottom: 200,
        paddingHorizontal: 10,
    },
    imageContainer: {
        width: '100%',
        height: 90,
        backgroundColor: colors.modalbg,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        gap: 8,
    },
    analysingText: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(14),
    },
    progressTrack: {
        width: PROGRESS_BAR_WIDTH,
        height: 3,
        backgroundColor: 'rgba(204, 158, 73, 0.12)',
        borderRadius: 2,
        overflow: 'visible',
    },
    progressFill: {
        height: 3,
        borderRadius: 2,
        overflow: 'visible',
        position: 'relative',
    },
    progressGradient: {
        flex: 1,
        borderRadius: 2,
    },
    progressGlow: {
        position: 'absolute',
        right: -2,
        top: -2.5,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#FFFEF5',
        shadowColor: '#FFE566',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
    },
    star1position: {
        position: 'absolute',
        top: 25,
        left: 10,
    },
    star2position: {
        position: 'absolute',
        top: 15,
        left: 10,
    },
    star3position: {
        position: 'absolute',
        top: 20,
        left: 28,
    },
    star4position: {
        position: 'absolute',
        top: 74,
        left: 10,
    },
    star5position: {
        position: 'absolute',
        top: 74,
        left: 20,
    },
    star6position: {
        position: 'absolute',
        top: 70,
        right: 18,
    },
    star7position: {
        position: 'absolute',
        top: 72,
        right: 35,
    },
    star8position: {
        position: 'absolute',
        top: 58,
        right: 28,
    },
    star9position: {
        position: 'absolute',
        top: 15,
        right: 55,
    },
    star10position: {
        position: 'absolute',
        top: 5,
        right: 35,
    },
    star11position: {
        position: 'absolute',
        top: 20,
        right: 30,
    },
    star12position: {
        position: 'absolute',
        top: 18,
        right: 15,
    },
    flowerStar1: {
        width: 5,
        height: 5,
    },
    flowerStar2: {
        width: 6,
        height: 6,
    },
    flowerStar3: {
        width: 7,
        height: 7,
    },
    flowerStar4: {
        width: 8,
        height: 8,
    },
    flowerStar5: {
        width: 9,
        height: 9,
    },
    flowerStar6: {
        width: 12,
        height: 12,
    },
    flower: {
        width: 50,
        height: 50,
        position: 'absolute',
        top: 40,
        left: 0,
    },
});

export default ReportLoader;
