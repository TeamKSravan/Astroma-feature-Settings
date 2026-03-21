import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { scale, verticalScale } from "../../utils/scale";
import { colors } from "../../constants/colors";
import { fonts } from "../../constants/fonts";
import ZodicSign from "../ZodicSign";
import { Delete, Edit } from "../../constants/svgpath";
import { capitalizeFirstLetter } from "../../utils/methods";

interface ItemUserProfileProps {
    user: any;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ItemUserProfile({ user, onEdit, onDelete }: ItemUserProfileProps) {
    const { name, date_of_birth, zodiac_sign, _id } = user;
    return (
        <View key={_id?.$oid} style={styles.itemcontainer}>
            <ZodicSign sign={zodiac_sign ?? ''} width={scale(50)} height={scale(50)} />
            <View style={styles.profileInfoView}>
                <Text style={styles.userNameText}>{capitalizeFirstLetter(name)}</Text>
                <Text style={styles.profileEmailText}>{date_of_birth}</Text>
            </View>
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity activeOpacity={0.8} onPress={onEdit}>
                    <Edit />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={onDelete}>
                    <Delete />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    itemcontainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: colors.modalbg,
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(8),
        borderRadius: scale(16),
        gap: scale(20),
    },
    profileInfoView: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    userNameText: {
        color: colors.white,
        fontFamily: fonts.bold,
        fontSize: scale(14),
    },
    profileEmailText: {
        color: colors.white,
        fontFamily: fonts.medium,
        fontStyle: 'italic',
        fontSize: scale(10),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: scale(10),
    },
});