import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ScrollView, FlatList } from 'react-native';
import BaseView from '../../../../utils/BaseView';
import imagepath from '../../../../constants/imagepath';
import { moderateScale, scale, verticalScale } from '../../../../utils/scale';
import { fonts } from '../../../../constants/fonts';
import { colors } from '../../../../constants/colors';
import { Sort, Transaction } from '../../../../constants/svgpath';
import i18n from '../../../../translation/i18n';
import BackButton from '../../../../components/BackButton';
import MultiSelectMenu from '../../../../components/MultiSelectMenu';
import { useProfileStore } from '../../../../store/useProfileStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import Loader from '../../../../components/Loader';
import moment from 'moment';

export default function TransactionHistory({ navigation }: any) {
    const { getTransactionHistory } = useProfileStore();
    const { isLoading } = useAuthStore();
    const [availableCoins, setAvailableCoins] = useState<number>(0);
    const [selectedSortOptions, setSelectedSortOptions] = useState<string[]>([]);

    const [transactionList, setTransactionList] = useState<any[]>([]);

    useEffect(() => {
        fetchTransactionHistory();
    }, []);

    const fetchTransactionHistory = async () => {
        const result = await getTransactionHistory();
        if (result.success && result.data) {
            console.log('Transaction history data : ', result);
            setAvailableCoins(result?.coins);
            setTransactionList(result?.data?.map((item: any) => ({
                title: item?.reason,
                date: item?.created_at?.$date,
                amount: item?.purchase,
                coins: item?.credits_change,
                type: item?.purchase !== null ? 'purchase' : 'use',
            })) ?? []);
        } else {
            setTransactionList([]);
        }
    }

    const sortOptions = [
        { label: i18n.t('transactionHistory.newestFirst'), value: 'newest' },
        { label: i18n.t('transactionHistory.oldestFirst'), value: 'oldest' },
        { label: i18n.t('transactionHistory.coinsHighToLow'), value: 'coinsHighToLow' },
        { label: i18n.t('transactionHistory.coinsLowToHigh'), value: 'coinsLowToHigh' },
        { label: i18n.t('transactionHistory.purchaseOnly'), value: 'purchaseOnly' },
        { label: i18n.t('transactionHistory.consumedOnly'), value: 'consumedOnly' },
    ];

    const filteredAndSortedList = useMemo(() => {
        let filtered = [...transactionList];

        // Filter by type
        if (selectedSortOptions.includes('purchaseOnly')) {
            filtered = filtered.filter(item => item.type === 'purchase');
        } else if (selectedSortOptions.includes('consumedOnly')) {
            filtered = filtered.filter(item => item.type === 'use');
        }

        // Sort by date
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

        // Sort by coins
        if (selectedSortOptions.includes('coinsHighToLow')) {
            filtered.sort((a, b) => parseInt(b.coins) - parseInt(a.coins));
        } else if (selectedSortOptions.includes('coinsLowToHigh')) {
            filtered.sort((a, b) => parseInt(a.coins) - parseInt(b.coins));
        }

        return filtered;
    }, [transactionList, selectedSortOptions]);

    const TransactionRenderItem = ({ transaction, type }: { transaction: any, type: 'purchase' | 'use' }) => {
        return (
            <View style={styles.transactionItemContainer}>
                <View style={styles.transactionItemRow}>
                    <View style={styles.transactionItemLeft}>
                        <Text style={styles.transactionTitle}>{transaction.title}</Text>
                        <Text style={styles.transactionDate}>{`${moment(transaction.date).format('DD MMM YYYY')}  |  ${moment(transaction.date).format('hh:mm A')}`}</Text>
                    </View>
                    <Text style={[styles.transactionAmount, { color: colors.green }]}>{type !== 'purchase' ? ' ' : `$${transaction.amount?.split(' ')[0]}`}</Text>
                    <Text style={[styles.transactionCoins, { color: type == 'purchase' || transaction.title?.includes('bonus') ? colors.green : colors.red2 }]}>{type == 'purchase' ? ' ' : ''}{transaction.coins} {i18n.t('transactionHistory.coins')}</Text>
                </View>
                <View style={styles.transactionDivider} />
            </View>
        )
    }
    return (
        <BaseView backgroundImage={imagepath.reportBg}>
            <View style={styles.headerContainer}>
                <BackButton />
                <View style={styles.headerView}>
                    <Transaction />
                    <View style={styles.helloView}>
                        <Text style={styles.nameText}>{i18n.t('transactionHistory.title')}</Text>
                    </View>
                </View>
            </View>
            {isLoading && <Loader />
                || <>
                    <View style={styles.sortButtonContainer}>
                        <MultiSelectMenu
                            options={sortOptions}
                            selectedValues={selectedSortOptions}
                            onSelect={(selectedValues) => setSelectedSortOptions(selectedValues)}
                            triggerComponent={
                                <View style={styles.sortButton}>
                                    <Text style={styles.sortButtonText}>{i18n.t('transactionHistory.sortBy')}</Text>
                                    <View style={styles.sortIconContainer}>
                                        <Sort />
                                    </View>
                                </View>
                            }
                            menuOptionsContainerStyle={styles.sortMenuContainer}
                            showClearAll
                        />
                    </View>
                    <View style={styles.availableCoinsHeader}>
                        <Text style={styles.availableCoinsTitle}>{i18n.t('transactionHistory.availableCoins')}</Text>
                        <Text style={styles.availableCoinsValue}>{availableCoins}</Text>
                    </View>
                    <ScrollView bounces={false} style={styles.container}>
                        <View>

                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderText, { flex: 1.8 }]}>{i18n.t('transactionHistory.transaction')}</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>{i18n.t('transactionHistory.purchase')}</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>{i18n.t('transactionHistory.coins')}</Text>
                            </View>
                            <FlatList
                                data={filteredAndSortedList}
                                renderItem={({ item }) => (
                                    <TransactionRenderItem key={item.id} transaction={item} type={item.type} />
                                )}
                                keyExtractor={(item) => item.id}
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('transactionHistory.noTransactions')}</Text>}
                            />
                            {/* {filteredAndSortedList.map((transaction, index) => (
                                <TransactionRenderItem key={index} transaction={transaction} type={transaction.type} />
                            ))} */}
                        </View>

                    </ScrollView>
                </>}
        </BaseView>
    );
}

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
    transactionCoins: {
        flex: 1,
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(16),
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
