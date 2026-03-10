import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import i18n from '../../translation/i18n';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { moderateScale, scale, verticalScale } from '../../utils/scale';
import { Categories, Cross } from '../../constants/svgpath';
import { useChatStore } from '../../store/useChatStore';
import UserList from '../UserList';
import { useProfileStore } from '../../store/useProfileStore';
import { ToastMessage } from '../ToastMessage';

type FilterChatModalProps = {
  closeModal: () => void;
  visible: boolean;
  navigation?: any;
  initialZodiacs?: string[];
  initialCategory?: string;
  onApplyFilters?: (filters: {
    zodiacSigns: string[];
    categories: string[];
  }) => void;
};

export default function FilterChatModal(props: FilterChatModalProps) {
  const {
    closeModal,
    visible,
    onApplyFilters,
    initialZodiacs = [],
    initialCategory = '',
  } = props;
  const { getCategories } = useChatStore();

  const { secondaryUserdata } = useProfileStore();
  const capitalizeFirst = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;
  const [categories, setCategories] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedZodiacs, setSelectedZodiacs] =
    useState<string[]>(initialZodiacs);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [baselineCategory, setBaselineCategory] = useState(initialCategory);
  const [baselineZodiacs, setBaselineZodiacs] = useState<string[]>(initialZodiacs);

  useEffect(() => {
    setLoading(true);
    getCategories().then(response => {
      setLoading(false);
      if (response.success && response.data) {
        setCategories(response.data as any);
      } else {
        setLoading(false);
        setCategories([]);
      }
    });
  }, []);
  // Update state when modal opens with new initial values
  useEffect(() => {
    if (visible) {
      setSelectedZodiacs(initialZodiacs);
      setSelectedCategory(initialCategory);
      setBaselineCategory(initialCategory);
      setBaselineZodiacs(initialZodiacs);
    }
  }, [visible, initialZodiacs, initialCategory]);

  const handleCategorySelect = (category: string) => {
    if(category === selectedCategory) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
  };

  const handleApply = () => {
    onApplyFilters?.({
      zodiacSigns: selectedZodiacs,
      categories: [selectedCategory],
    });
    ToastMessage(i18n.t('filters.applied'));
    closeModal();
  };

  const handleReset = () => {
    setSelectedZodiacs([]);
    setSelectedCategory('');
    setBaselineCategory('');
    setBaselineZodiacs([]);
    ToastMessage(i18n.t('filters.resetSuccess'));
  };

  const hasSelectionChanged =
    selectedCategory !== baselineCategory 
    //JSON.stringify([...selectedZodiacs].sort()) !== JSON.stringify([...baselineZodiacs].sort());

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={closeModal}
      backdropOpacity={0.4}
      isVisible={visible}
      style={styles.modal}
    >
      <View style={styles.modalView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>{i18n.t('filters.reset')}</Text>
          </TouchableOpacity>
          <Text style={styles.titleText}>{i18n.t('filters.title')}</Text>
          <TouchableOpacity onPress={closeModal}>
            <Cross />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Zodiac Signs */}
          {secondaryUserdata && secondaryUserdata?.length > 0 && <View style={styles.profileView}>
            <UserList showAddUser={false} disableUserSelection={true} />
          </View>}

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <View style={styles.categoryHeader}>
              <Categories />
              <Text style={styles.categoryTitle}>{i18n.t('filters.categories')}</Text>
            </View>
            <View style={styles.categoriesContainer}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryPill,
                    selectedCategory === category &&
                    styles.categoryPillSelected,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                      styles.categoryTextSelected,
                    ]}
                  >
                    {capitalizeFirst(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        {selectedCategory !== '' && (
          <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
            <Text style={styles.applyButtonText}>{i18n.t('filters.apply')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: colors.modalbg,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: '55%',
    paddingTop: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    // marginBottom: verticalScale(24),
  },
  resetText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontFamily: fonts.regular,
  },
  titleText: {
    fontSize: moderateScale(18),
    color: colors.white,
    fontFamily: fonts.semiBold,
  },
  categoriesSection: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  categoryHeader: {
    marginVertical: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  categoryTitle: {
    fontSize: moderateScale(16),
    color: colors.white,
    fontFamily: fonts.semiBold,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(14),
  },
  categoryPill: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: colors.white,
  },
  categoryPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: moderateScale(12),
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  profileView: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(10),
  },
  applyButton: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(24),
    marginTop: verticalScale(12),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: moderateScale(16),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});
