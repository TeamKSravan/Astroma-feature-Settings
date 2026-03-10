import React from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu"
import { colors } from '../constants/colors';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { fonts } from '../constants/fonts';

interface Option {
    label: string;
    value: string;
}

interface OptionMenuProps {
    options: Option[];
    triggerComponent: React.ReactNode;
    onSelect: (value: string) => void;
    customMenuComponent?: (option: Option) => React.ReactNode;
    menuOptionsContainerStyle?: StyleProp<ViewStyle>;
    menuOptionTextStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    customStyles?: {
        optionsContainer?: StyleProp<ViewStyle>;
    };
}

const OptionMenu = ({ 
    options, 
    triggerComponent, 
    onSelect, 
    menuOptionsContainerStyle, 
    menuOptionTextStyle, 
    style, 
    customMenuComponent,
    customStyles
}: OptionMenuProps) => {
    return (
        <Menu onSelect={onSelect} style={style}>
            <MenuTrigger>
                {triggerComponent}
            </MenuTrigger>
            <MenuOptions 
                optionsContainerStyle={[styles.optionsContainerStyle, menuOptionsContainerStyle]}
                customStyles={customStyles}
            >
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    nestedScrollEnabled={true}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    {options.map((option) => (
                        <MenuOption key={option.value} value={option.value}>
                            {customMenuComponent ? customMenuComponent(option) : <Text style={[styles.optionStyle, menuOptionTextStyle]}>{option.label}</Text>}
                        </MenuOption>
                    ))}
                </ScrollView>
            </MenuOptions>
        </Menu>
    )
}
const styles = StyleSheet.create({
    optionsContainerStyle: {
        backgroundColor: colors.menuBg,
        borderRadius: scale(12),
        padding: scale(10),
        width: '40%',
    },
    optionStyle: {
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(16),
    },
    scrollView: {
        maxHeight: verticalScale(200),
    },
    scrollViewContent: {
        flexGrow: 1,
    },
});
export default OptionMenu;