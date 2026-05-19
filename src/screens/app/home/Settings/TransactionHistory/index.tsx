import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ScrollView, FlatList } from 'react-native';
import BaseView from '../../../../../utils/BaseView';
import imagepath from '../../../../../constants/imagepath';
import { moderateScale, scale, verticalScale } from '../../../../../utils/scale';
import { fonts } from '../../../../../constants/fonts';
import { colors } from '../../../../../constants/colors';
import { Sort, Transaction } from '../../../../../constants/svgpath';
import i18n from '../../../../../translation/i18n';
import BackButton from '../../../../../components/BackButton';
import MultiSelectMenu from '../../../../../components/MultiSelectMenu';
import { useProfileStore } from '../../../../../store/useProfileStore';
import { formatNumberWithCommas } from '../../../../../utils/methods';
import Loader from '../../../../../components/Loader';
import moment from 'moment';

function TransactionHistory({ navigation }: any) {
    const { getTransactionHistory } = useProfileStore();
    const [isLoading, setIsLoading] = useState(false);
    const [availableCoins, setAvailableCoins] = useState<number>(0);
    const [selectedSortOptions, setSelectedSortOptions] = useState<string[]>([]);
    const [transactionList, setTransactionList] = useState<any[]>([]);

    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        const fetch = async () => {
            setIsLoading(true);
            const result = await getTransactionHistory();
            if (result.success && result.data) {
                setAvailableCoins(result?.coins ?? 0);
                setTransactionList(result?.data?.map((item: any) => ({
                    title: item?.reason,
                    date: item?.created_at?.$date,
                    amount: item?.purchase,
                    coins: item?.credits_change,
                    type: item?.purchase !== null ? 'purchase' : 'use',
                })) ?? []);
                hasFetchedRef.current = true;
            } else {
                setTransactionList([]);
            }
            setIsLoading(false);
        };
        fetch();
    }, [getTransactionHistory]);

    const sortOptions = useMemo(() => [
        { label: i18n.t('transactionHistory.newestFirst'), value: 'newest' },
        { label: i18n.t('transactionHistory.oldestFirst'), value: 'oldest' },
        { label: i18n.t('transactionHistory.coinsHighToLow'), value: 'coinsHighToLow' },
        { label: i18n.t('transactionHistory.coinsLowToHigh'), value: 'coinsLowToHigh' },
        { label: i18n.t('transactionHistory.purchaseOnly'), value: 'purchaseOnly' },
        { label: i18n.t('transactionHistory.consumedOnly'), value: 'consumedOnly' },
    ], []);

    const filteredAndSortedList = useMemo(() => {
        let filtered = [...transactionList];

        if (selectedSortOptions.includes('purchaseOnly')) {
            filtered = filtered.filter(item => item.type === 'purchase');
        } else if (selectedSortOptions.includes('consumedOnly')) {
            filtered = filtered.filter(item => item.type === 'use');
        }

        if (selectedSortOptions.includes('newest')) {
            filtered.sort((a, b) => {
                const dateA = new Date(a.date.split('|')[0].trim());
                const dateB = new Date(b.date.split('|')[0].trim());
                return dateB.getTime() - dateA.getTime();
            });
        } else if (selectedSortOptions.includes('oldest')) {
            filtered.sort((a, b) => {
                const dateA = new Date(a.date.split('|')[0].trim());
                const dateB = new Date(b.date.split('|')[0].trim());
                return dateA.getTime() - dateB.getTime();
            });
        }

        if (selectedSortOptions.includes('coinsHighToLow')) {
            filtered.sort((a, b) => parseInt(b.coins) - parseInt(a.coins));
        } else if (selectedSortOptions.includes('coinsLowToHigh')) {
            filtered.sort((a, b) => parseInt(a.coins) - parseInt(b.coins));
        }

        return filtered;
    }, [transactionList, selectedSortOptions]);

    const onSelectSort = useCallback((selectedValues: string[]) => {
        setSelectedSortOptions(selectedValues);
    }, []);

    const keyExtractor = useCallback((item: any) => item.id, []);

    const renderItem = useCallback(({ item }: { item: any }) => {
        const coinsColor = item.type === 'purchase' || item.title?.includes('bonus') || item.title?.toLowerCase()?.includes('reward') ? colors.green : colors.red2;
        return (
            <View style={styles.transactionItemContainer}>
                <View style={styles.transactionItemRow}>
                    <View style={styles.transactionItemLeft}>
                        <Text style={styles.transactionTitle}>{item.title}</Text>
                        <Text style={styles.transactionDate}>{`${moment(item.date).format('DD MMM YYYY')}  |  ${moment(item.date).format('hh:mm A')}`}</Text>
                    </View>
                    <Text style={[styles.transactionAmount, amountGreenStyle]}>{item.type !== 'purchase' ? ' ' : `$${formatNumberWithCommas(item.amount?.split(' ')[0])}`}</Text>
                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.transactionCoins, { color: coinsColor }]}>{item.type === 'purchase' ? ' ' : ''}{formatNumberWithCommas(item.coins)}
                        <Text style={[styles.transactionCoinsText, { color: coinsColor }]}>{' ' + i18n.t('transactionHistory.coins')}</Text>
                    </Text>
                </View>
                <View style={styles.transactionDivider} />
            </View>
        );
    }, []);

    const header = useMemo(() => (
        <View style={styles.headerContainer}>
            <BackButton />
            <View style={styles.headerView}>
                <Transaction />
                <View style={styles.helloView}>
                    <Text style={styles.nameText}>{i18n.t('transactionHistory.title')}</Text>
                </View>
            </View>
        </View>
    ), []);

    const sortTrigger = useMemo(() => (
        <View style={styles.sortButton}>
            <Text style={styles.sortButtonText}>{i18n.t('transactionHistory.sortBy')}</Text>
            <View style={styles.sortIconContainer}>
                <Sort />
            </View>
        </View>
    ), []);

    const sortSection = useMemo(() => (
        <View style={styles.sortButtonContainer}>
            <MultiSelectMenu
                options={sortOptions}
                selectedValues={selectedSortOptions}
                onSelect={onSelectSort}
                triggerComponent={sortTrigger}
                menuOptionsContainerStyle={styles.sortMenuContainer}
                showClearAll
            />
        </View>
    ), [sortOptions, selectedSortOptions, onSelectSort, sortTrigger]);

    const coinsHeader = useMemo(() => (
        <View style={styles.availableCoinsHeader}>
            <Text style={styles.availableCoinsTitle}>{i18n.t('transactionHistory.availableCoins')}</Text>
            <Text adjustsFontSizeToFit={true} numberOfLines={1} ellipsizeMode="tail" style={styles.availableCoinsValue}>{formatNumberWithCommas(availableCoins)}</Text>
        </View>
    ), [availableCoins]);

    const tableHeader = useMemo(() => (
        <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, tableHeaderFlex1_8]}>{i18n.t('transactionHistory.transaction')}</Text>
            <Text style={[styles.tableHeaderText, tableHeaderFlex1]}>{i18n.t('transactionHistory.purchase')}</Text>
            <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.tableHeaderText, tableHeaderFlex1]}>{i18n.t('transactionHistory.coins')}</Text>
        </View>
    ), []);

    const listEmptyComponent = useMemo(() => (
        <Text style={styles.emptyText}>{i18n.t('transactionHistory.noTransactions')}</Text>
    ), []);

    const transactionsList = useMemo(() => (
        <FlatList
            data={filteredAndSortedList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            bounces={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={listEmptyComponent}
        />
    ), [filteredAndSortedList, renderItem, keyExtractor, listEmptyComponent]);

    const content = useMemo(() => (
        isLoading ? <Loader /> : (
            <>
                {sortSection}
                {coinsHeader}
                <ScrollView bounces={false} style={styles.container}>
                    <View>
                        {tableHeader}
                        {transactionsList}
                    </View>
                </ScrollView>
            </>
        )
    ), [isLoading, sortSection, coinsHeader, tableHeader, transactionsList]);

    return (
        <BaseView backgroundImage={imagepath.reportBg}>
            {header}
            {content}
        </BaseView>
    );
}

export default React.memo(TransactionHistory);

const amountGreenStyle = { color: colors.green };
const tableHeaderFlex1_8 = { flex: 1.8 };
const tableHeaderFlex1 = { flex: 1 };

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: scale(15),
        gap: scale(10),
    },
    helloView: {
        gap: verticalScale(4),
    },
    nameText: {
        color: colors.white,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(16),
    },
    transactionItemContainer: {
        paddingHorizontal: scale(20),
        gap: verticalScale(10),
        marginBottom: verticalScale(15),
    },
    transactionItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionItemLeft: {
        flex: 1.8,
        gap: scale(5),
    },
    transactionTitle: {
        color: colors.white,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(14),
    },
    transactionDate: {
        color: colors.white,
        fontFamily: fonts.medium,
        fontSize: moderateScale(10),
    },
    transactionAmount: {
        flex: 1,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(16),
    },
    transactionCoinsText: {
        fontFamily: fonts.regular,
        fontSize: moderateScale(14),
    },
    transactionCoins: {
        flex: 1,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(18),
    },
    transactionDivider: {
        width: '100%',
        height: 0.3,
        backgroundColor: colors.white,
    },
    sortButtonContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: scale(15),
        marginTop: verticalScale(15),
    },
    sortButton: {
        flexDirection: 'row',
        gap: scale(10),
    },
    sortButtonText: {
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(14),
    },
    sortIconContainer: {
        width: scale(12),
        height: scale(18),
    },
    availableCoinsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: scale(65),
        backgroundColor: colors.primary,
        borderTopLeftRadius: scale(16),
        borderTopRightRadius: scale(16),
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(12),
        marginTop: verticalScale(15),
    },
    availableCoinsTitle: {
        color: colors.black,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(20),
    },
    availableCoinsValue: {
        color: colors.black,
        width: scale(70),
        fontFamily: fonts.regular,
        fontSize: moderateScale(24),
    },
    tableHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: verticalScale(20),
    },
    tableHeaderText: {
        color: colors.white,
        fontFamily: fonts.medium,
        fontSize: moderateScale(14),
    },
    sortMenuContainer: {
        backgroundColor: colors.menuBg,
        borderRadius: scale(12),
        padding: scale(10),
        minWidth: scale(200),
        maxWidth: scale(250),
    },
    emptyText: {
        color: colors.white,
        fontFamily: fonts.regular,
        fontSize: moderateScale(14),
        textAlign: 'center',
        marginTop: verticalScale(20),
    },
});
