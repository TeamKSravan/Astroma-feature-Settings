import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import { ModalClose, SearchIcon } from '../../constants/svgpath';
import moment from 'moment-timezone';
import i18n from '../../translation/i18n';

type TimeZoneModalProps = {
  closeModal: () => void;
  visible: boolean;
  value: string;
  onTimezoneSelect: (timezone: any) => void;
};
const SEARCH_BG = '#2A2A2A';

export default function TimeZoneModal(props: TimeZoneModalProps) {
  const { closeModal, visible, onTimezoneSelect, value } = props;

  const [timezones, setTimezones] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const ITEM_HEIGHT = verticalScale(10) * 2 + 20; // padding + text
  const SEPARATOR_HEIGHT = 1 + verticalScale(10) * 2;
  const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + SEPARATOR_HEIGHT;

  useEffect(() => {
    const zones = moment.tz.names().map(zone => ({
      label: `(GMT${moment.tz(zone).format('Z')}) ${zone}`,
      value: zone
    }));
    setTimezones(zones);
  }, []);

  const scrollToSelected = () => {
    if (!value || timezones.length === 0) return;
    const index = timezones.findIndex(tz => tz.value === value);
    if (index >= 0) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }, 50);
      });
    }
  };

  const handleModalShow = () => {
    scrollToSelected();
  };

  const handleTimezoneSelect = (timezone: any) => {
    onTimezoneSelect(timezone);
    closeModal();
  };


  const TimezoneRenderItem = ({ item }: { item: any }) => {
    const isSelected = item.value === value;
    return (
      <TouchableOpacity
        style={[styles.timezoneItem, isSelected && styles.timezoneItemSelected]}
        onPress={() => handleTimezoneSelect(item)}
      >
        <Text style={[styles.billLabel, isSelected && styles.timezoneItemTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const filteredTimezones = timezones.filter(tz => tz.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={closeModal}
      backdropOpacity={0.8}
      isVisible={visible}
      onModalShow={handleModalShow}
    >
      <View style={styles.modalView}>
        <View style={styles.ceneteredView}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <ModalClose width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.orderTitle}>{i18n.t('timezone.timezone')}</Text>
          <Text style={styles.billLabel}>{i18n.t('timezone.selectTimezone')}</Text>
          <View style={styles.searchWrap}>
            <SearchIcon width={scale(20)} height={scale(20)} />
            <TextInput
              style={styles.searchInput}
              placeholder={i18n.t('timezone.searchTimezone')}
              placeholderTextColor={colors.lightGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.planSummaryContainer}>
            <FlatList
              ref={flatListRef}
              data={filteredTimezones}
              renderItem={TimezoneRenderItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={
                value && timezones.length > 0
                  ? Math.max(0, timezones.findIndex(tz => tz.value === value))
                  : 0
              }
              getItemLayout={(_, index) => ({
                length: TOTAL_ITEM_HEIGHT,
                offset: TOTAL_ITEM_HEIGHT * index,
                index,
              })}
              onScrollToIndexFailed={({ index }) => {
                flatListRef.current?.scrollToOffset({
                  offset: Math.min(index * TOTAL_ITEM_HEIGHT, timezones.length * TOTAL_ITEM_HEIGHT - scale(200)),
                  animated: true,
                });
              }}
              style={styles.timezonesList}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: colors.modalbg,
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
  },

  ceneteredView: {
    alignItems: 'center',
    paddingHorizontal: scale(10),
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
  },
  orderTitle: {
    fontSize: scale(16),
    color: colors.white,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: verticalScale(5),
  },
  billLabel: {
    fontSize: scale(12),
    color: colors.white,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_BG,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: verticalScale(15),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    gap: scale(8),
  },
  searchIcon: {
    fontSize: moderateScale(16),
    color: colors.lightGray,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
    color: colors.white,
    padding: 0,
  },
  billValue: {
    fontSize: scale(14),
    color: colors.white,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  noView: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(25),
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
  },
  yesView: {
    backgroundColor: colors.primary,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(25),
    flex: 1,
  },
  noText: {
    fontSize: moderateScale(16),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: 34,
  },
  yesText: {
    fontSize: moderateScale(16),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: 34,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  planSummaryContainer: {
    marginTop: 10,
    borderWidth: 1,
    backgroundColor: colors.neutral700,
    width: '100%',
    borderRadius: scale(16),
    alignItems: 'flex-start',
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(15),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: verticalScale(5),
  },
  timezonesList: {
    marginTop: 10,
    height: scale(200),
    width: '100%',
  },
  timezoneItem: {
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral700,
    borderRadius: scale(8),
  },
  timezoneItemSelected: {
    backgroundColor: colors.primary + '20',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  timezoneItemText: {
    fontSize: scale(12),
    color: colors.white,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  timezoneItemTextSelected: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  separator: {
    height: 1,
    backgroundColor: colors.white,
    marginVertical: verticalScale(10),
  },
});
