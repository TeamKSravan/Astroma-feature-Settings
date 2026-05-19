import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { History, NewChat, SearchIcon, More, NewChatIcon } from '../constants/svgpath';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import i18n from '../translation/i18n';
import { useChatStore } from '../store/useChatStore';
import { useProfileStore } from '../store/useProfileStore';
import OptionMenu from './OptionMenu';
import DeleteModal from './modals/DeleteModal';
import EditConversation from './modals/EditConversation';
import { ToastMessage } from './ToastMessage';

const SIDE_PANEL_WIDTH = verticalScale(300);
const PANEL_BG = '#1E1E1E';
const SEARCH_BG = '#2A2A2A';

const OPTIONS = [
  { label: i18n.t('common.delete'), value: 'delete' },
  { label: i18n.t('common.rename'), value: 'rename' },
];

export interface ChatHistoryItem {
  title?: string;
  _id?: { $oid?: string };
}

export interface ChatSidePanelProps {
  visible: boolean;
  onClose: () => void;
  onChatHistory?: () => void;
  onFilters?: () => void;
  onNewChat?: () => void;
  onExitChat?: () => void;
  onSelectChat?: (chatId: string) => void;
}

function ChatSidePanel({
  visible,
  onClose,
  onChatHistory,
  onFilters,
  onNewChat,
  onExitChat,
  onSelectChat,
}: ChatSidePanelProps) {
  const panelAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const afterCloseActionRef = useRef<(() => void) | null>(null);
  const isOpenRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistoryList, setChatHistoryList] = useState<ChatHistoryItem[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<ChatHistoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const { getChatHistory, deleteChatHistory, deleteAllChatHistory } = useChatStore();
  const { selectedUser } = useProfileStore();
  const lastFetchKeyRef = useRef<string | null>(null);
  const hasEverLoadedRef = useRef(false);

  const fetchChatHistory = useCallback(async (query = '', force = false) => {
    const userId = (selectedUser as any)?._id?.$oid ?? '';
    const fetchKey = `${userId}_${query}`;
    if (!force && lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;

    if (!hasEverLoadedRef.current) setLoading(true);
    try {
      const result = await getChatHistory(userId, query);
      if (result.success && result.data) {
        setChatHistoryList((result.data as unknown as ChatHistoryItem[]) || []);
      } else {
        setChatHistoryList([]);
      }
      hasEverLoadedRef.current = true;
    } catch {
      setChatHistoryList([]);
    } finally {
      setLoading(false);
    }
  }, [getChatHistory, selectedUser]);

  const filteredList = useMemo(() =>
    searchQuery.trim()
      ? chatHistoryList.filter((item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      : chatHistoryList,
    [chatHistoryList, searchQuery],
  );

  const displayList = useMemo(() =>
    filteredList.filter((item) => item._id?.$oid !== 'new'),
    [filteredList],
  );

  useEffect(() => {
    if (visible) {
      isOpenRef.current = true;
      setIsMounted(true);
      setSearchQuery('');
      afterCloseActionRef.current = null;
      fetchChatHistory('');
      Animated.parallel([
        Animated.timing(panelAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else if (isOpenRef.current) {
      isOpenRef.current = false;
      Animated.parallel([
        Animated.timing(panelAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setIsMounted(false);
        onClose();
      });
    }
  }, [visible]);

  const closePanel = useCallback((action?: () => void) => {
    afterCloseActionRef.current = action ?? null;
    Animated.parallel([
      Animated.timing(panelAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      isOpenRef.current = false;
      setIsMounted(false);
      onClose();
      afterCloseActionRef.current?.();
      afterCloseActionRef.current = null;
    });
  }, [panelAnim, overlayAnim, onClose]);

  const handleOverlayPress = useCallback(() => closePanel(), [closePanel]);

  const handleSelectChat = useCallback((item: ChatHistoryItem) => {
    const id = item._id?.$oid;
    if (id && id !== 'new') {
      closePanel(() => onSelectChat?.(id));
    }
  }, [closePanel, onSelectChat]);

  const handleNewChat = useCallback(() => closePanel(onNewChat), [closePanel, onNewChat]);

  const handleDeleteAll = useCallback(async () => {
    const userId = (selectedUser as any)?._id?.$oid ?? '';
    const result = await deleteAllChatHistory(userId);
    if (result.success) {
      setChatHistoryList([]);
      lastFetchKeyRef.current = null;
      hasEverLoadedRef.current = false;
      onNewChat?.();
      ToastMessage(i18n.t('chatHistory.deletedSuccess'));
    }
  }, [deleteAllChatHistory, onNewChat, selectedUser]);

  const handleDelete = useCallback(async (chatItem: ChatHistoryItem | null) => {
    const id = chatItem?._id?.$oid;
    if (!id) return;
    const result = await deleteChatHistory(id);
    if (result.success) {
      setChatHistoryList((prev) => prev.filter((item) => item._id?.$oid !== id));
      lastFetchKeyRef.current = null;
      setShowDeleteModal(false);
      setSelectedUserData(null);
      ToastMessage(i18n.t('chatHistory.deletedSuccess'));
    }
  }, [deleteChatHistory]);

  const handleOptionSelect = useCallback((value: string) => {
    if (value === 'delete') {
      setShowDeleteModal(true);
    } else if (value === 'rename') {
      setShowEditModal(true);
    }
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedUserData) {
      handleDelete(selectedUserData);
    }
    setShowDeleteModal(false);
  }, [selectedUserData, handleDelete]);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedUserData(null);
  }, []);

  const closeDeleteAllModal = useCallback(() => {
    setShowDeleteAllModal(false);
    setSelectedUserData(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedUserData(null);
  }, []);

  const openDeleteAllModal = useCallback(() => setShowDeleteAllModal(true), []);

  const keyExtractor = useCallback((item: ChatHistoryItem) => item._id?.$oid ?? String(Math.random()), []);

  const renderItem = useCallback(({ item }: { item: ChatHistoryItem }) => (
    <View style={styles.chatItem}>
      <TouchableOpacity
        style={styles.chatItemTouch}
        onPress={() => handleSelectChat(item)}
        activeOpacity={0.7}
      >
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.chatItemText}>
          {item.title}
        </Text>
      </TouchableOpacity>
      <View style={styles.actionButtonsContainer}>
        <OptionMenu
          options={OPTIONS}
          triggerComponent={<More />}
          onSelect={(value) => {
            setSelectedUserData(item);
            handleOptionSelect(value);
          }}
        />
      </View>
    </View>
  ), [handleSelectChat, handleOptionSelect]);

  const listEmptyComponent = useMemo(() => (
    <Text style={styles.emptyText}>
      {i18n.t('chatHistory.noHistory')}
    </Text>
  ), []);

  const loaderView = useMemo(() => (
    <View style={styles.loaderWrapper}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  ), []);

  const overlayStyle = useMemo(() => [
    styles.overlay,
    {
      opacity: overlayAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  ], [overlayAnim]);

  const panelStyle = useMemo(() => [
    styles.panel,
    {
      width: SIDE_PANEL_WIDTH,
      transform: [{
        translateX: panelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-SIDE_PANEL_WIDTH, 0],
        }),
      }],
    },
  ], [panelAnim]);

  const deleteModal = useMemo(() => (
    <DeleteModal
      closeModal={closeDeleteModal}
      visible={showDeleteModal}
      handleVerify={handleDeleteConfirm}
      title={i18n.t('chatHistory.deleteTitle')}
      description={i18n.t('chatHistory.deleteDescription')}
    />
  ), [showDeleteModal, closeDeleteModal, handleDeleteConfirm]);

  const deleteAllModal = useMemo(() => (
    <DeleteModal
      closeModal={closeDeleteAllModal}
      visible={showDeleteAllModal}
      handleVerify={handleDeleteAll}
      title={i18n.t('chatHistory.deleteAllTitle')}
      description={i18n.t('chatHistory.deleteAllDescription')}
    />
  ), [showDeleteAllModal, closeDeleteAllModal, handleDeleteAll]);

  const reloadAfterEdit = useCallback(() => {
    lastFetchKeyRef.current = null;
    fetchChatHistory(searchQuery);
  }, [fetchChatHistory, searchQuery]);

  const editModal = useMemo(() => (
    <EditConversation
      title={selectedUserData?.title ?? ''}
      id={selectedUserData?._id?.$oid ?? ''}
      closeModal={closeEditModal}
      visible={showEditModal}
      reload={reloadAfterEdit}
    />
  ), [selectedUserData, showEditModal, closeEditModal, reloadAfterEdit]);

  const clearHistoryButton = useMemo(() => (
    filteredList.length > 0 ? (
      <TouchableOpacity onPress={openDeleteAllModal}>
        <Text style={styles.sectionSubText}>
          {i18n.t('chatHistory.clearHistory')}
        </Text>
      </TouchableOpacity>
    ) : null
  ), [filteredList.length, openDeleteAllModal]);

  if (!visible && !isMounted) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View style={overlayStyle} />
      </TouchableWithoutFeedback>
      <Animated.View style={panelStyle}>
        <View style={styles.searchWrap}>
          <SearchIcon width={scale(20)} height={scale(20)} />
          <TextInput
            style={styles.searchInput}
            placeholder={i18n.t('chatHistory.searchChats')}
            placeholderTextColor={colors.lightGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.newChatRow}
          onPress={handleNewChat}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <View style={styles.newChatIconRight}>
              <NewChat width={scale(25)} height={scale(25)} />
            </View>
          </View>
          <Text style={styles.newChatText}>{i18n.t('chatHistory.newChat')}</Text>
          <NewChatIcon width={scale(25)} height={scale(25)} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <View style={styles.iconWrap}>
            <History width={scale(25)} height={scale(25)} />
          </View>
          <Text style={styles.sectionHeaderText}>
            {i18n.t('chatHistory.title')}
          </Text>
          {clearHistoryButton}
        </View>

        {loading ? loaderView : (
          <FlatList
            data={displayList}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={listEmptyComponent}
          />
        )}

        {deleteModal}
        {deleteAllModal}
        {editModal}
      </Animated.View>
    </>
  );
}

export default React.memo(ChatSidePanel);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
    zIndex: 1000,
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: -20,
    bottom: 0,
    backgroundColor: PANEL_BG,
    zIndex: 1001,
    paddingTop: Platform.OS === 'ios' ? verticalScale(65) : verticalScale(35),
    borderTopRightRadius: scale(16),
    borderBottomRightRadius: scale(16),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: moderateScale(18),
  },
  profileInfoView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: scale(8),
  },
  closeText: {
    color: colors.white,
    fontSize: moderateScale(20),
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_BG,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: verticalScale(10),
    marginHorizontal: scale(20),
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
  iconWrap: {
    width: scale(24),
    height: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(18),
    gap: scale(12),
    marginTop: verticalScale(8),
  },
  newChatText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(13),
  },
  newChatIconRight: {
    width: scale(32),
    height: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    gap: scale(12),
  },
  sectionHeaderText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(13),
  },
  sectionSubText: {
    color: colors.blue300,
    fontFamily: fonts.semiBold,
    fontSize: moderateScale(11),
  },
  loaderWrapper: {
    flex: 1,
    marginTop: verticalScale(40),
    alignItems: 'center',
  },
  list: {
    flex: 1,
    marginTop: verticalScale(4),
  },
  listContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(24),
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.menuBorder,
  },
  chatItemTouch: {
    flex: 1,
  },
  chatItemText: {
    color: colors.lightYellow,
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
  },
  emptyText: {
    color: colors.lightGray,
    fontFamily: fonts.regular,
    fontSize: moderateScale(13),
    paddingVertical: verticalScale(20),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: scale(10),
  },
});
