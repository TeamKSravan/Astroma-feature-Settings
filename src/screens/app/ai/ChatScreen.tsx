import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  BackHandler,
  Keyboard,
} from 'react-native';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import imagepath from '../../../constants/imagepath';
import { HamburgerMenu, SmallStar, TwinStars } from '../../../constants/svgpath';
import { UserIcon } from '../../../components/UserList';
import i18n from '../../../translation/i18n';
import { isTablet, moderateScale, scale, verticalScale } from '../../../utils/scale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import CommonHeader from '../../../components/CommonHeader';
import ChatMessage from '../../../components/ChatMessage';
import SuggestedQuestion, { Question } from '../../../components/SuggestedQuestions';
import BaseView from '../../../utils/BaseView';
import GradientTextInput from '../../../components/GradientTextInput';
import TypingIndicator from '../../../components/TypingIndicator';
import AxiosBase from '../../../services/AxiosBase';
import ExitChatModal from '../../../components/modals/ExitChatModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useChatStore } from '../../../store/useChatStore';
import { useProfileStore } from '../../../store/useProfileStore';
import { ToastMessage } from '../../../components/ToastMessage';
import { useWalletStore } from '../../../store/useWalletStore';
import EmptyCredits from '../../../components/EmptyCredits';
import ChatSidePanel from '../../../components/ChatSidePanel';
import BackButton from '../../../components/BackButton';
import { Routes } from '../../../navigation/RouteNames';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  item: any;
  category: string;
}

const LOWER_COUNT = 1;
const KAV_OFFSET_IOS = 20;
const KAV_OFFSET_ANDROID = 50;
const TAB_BAR_HEIGHT_IOS = 80;
const TAB_BAR_HEIGHT_ANDROID = 65;
const BACK_BUTTON_STYLE = {
  position: 'relative' as const,
  left: scale(0),
  width: scale(24),
  height: scale(24),
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: colors.modalbg,
  borderRadius: scale(5),
};

function ChatScreen(props: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isdisablesendbutton, setIsDisableSendButton] = useState(false);
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exitChatModalVisible, setExitChatModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const { generateQuery, getChatMessageHistory } = useChatStore();
  const navigation = useNavigation();
  const { chatType, reportId, report, chatHistoryId, chatHistoryEmpty } = props.route.params || { chatType: null, reportId: null, report: null, chatHistoryId: null, chatHistoryEmpty: false };
  const { selectedUser } = useProfileStore();
  const { getWalletDetails, availableCoins, setAvailableCoins } = useWalletStore();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios'
    ? verticalScale(TAB_BAR_HEIGHT_IOS)
    : verticalScale(TAB_BAR_HEIGHT_ANDROID) + insets.bottom;
  const inputBottomInset = tabBarHeight;
  const keyboardVerticalOffset = Platform.OS === 'ios'
    ? (isTablet() ? inputBottomInset : KAV_OFFSET_IOS)
    : KAV_OFFSET_ANDROID;

  const sparkleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const sparkleStyles = useMemo(() =>
    sparkleAnims.map(anim => ({
      opacity: anim.interpolate({ inputRange: [0, 0.75, 1, 1.25], outputRange: [0, 0.4, 1, 0.5] }),
      transform: [{ scale: anim.interpolate({ inputRange: [0, 0.75, 1, 1.25], outputRange: [0, 0.7, 1, 1.2] }) }],
    })),
    [sparkleAnims],
  );

  useEffect(() => {
    sparkleAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(i * 300),
        Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1.25, duration: 3000, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.75, duration: 3000, useNativeDriver: true }),
          ]),
        ).start();
      });
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (availableCoins < LOWER_COUNT) {
        navigation.navigate('AiAstrologer');
      }
    }, [])
  );

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (chatHistoryId) {
      fetchChatHistory(chatHistoryId);
    }
  }, [chatHistoryId]);

  useEffect(() => {
    if (chatHistoryEmpty) {
      setMessages([]);
      setInputText('');
      setIsLoading(false);
    }
  }, [chatHistoryEmpty]);

  const selectedUserId = (selectedUser as any)?._id?.$oid ?? null;
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    resetChat();
  }, [selectedUserId]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (sidePanelOpen) {
          setSidePanelOpen(false);
          return true;
        }
        setExitChatModalVisible(true);
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [sidePanelOpen])
  );

  const fetchChatHistory = useCallback(async (historyId: string) => {
    const result = await getChatMessageHistory(historyId, (selectedUser as any)?._id?.$oid ?? '');
    if (result.success && result.data) {
      const mappedMessages = result.data?.map((item: any) => ({
        id: item?._id?.$oid,
        text: item?.message.trim(),
        isUser: item?.role == 'user' ? true : false,
        timestamp: item?.created_at ? new Date(item.created_at?.$date) : new Date(),
        item: item,
        conversation_id: item?.conversation_id?.$oid ?? '',
        isLiked: item?.is_liked,
        isDisliked: item?.is_disliked,
      }));
      const sortedByTime = [...mappedMessages].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      setMessages(sortedByTime);
      setIsLoading(false);
      scrollToBottom();
    } else {
      setMessages([]);
      setIsLoading(false);
    }
  }, [getChatMessageHistory, selectedUser]);

  useEffect(() => {
    if (chatType === 'viewReport') {
      setMessages(report?.map((item: any) => ({
        id: item?._id,
        text: item?.message,
        isUser: item?.role == 'user' ? true : false,
        timestamp: item?.created_at ? new Date(item.created_at) : new Date(),
        item: {
          conversation_id: {
            $oid: item?.conversation_id ?? '',
          },
        },
        conversation_id: item?.conversation_id ?? '',
        isLiked: item?.is_liked,
        isDisliked: item?.is_disliked,
      })));
      setIsDisableSendButton(false);
    }
    if (chatType === 'report') {
      setMessages(report);
    }
  }, [chatType, report]);

  useEffect(() => {
    Animated.spring(scrollButtonAnim, {
      toValue: showScrollButton ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [showScrollButton]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].isUser) {
      const timer = setTimeout(() => {
        smoothScrollToBottom(250);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setInputText('');
    setIsLoading(false);
  }, []);

  const smoothScrollToBottom = useCallback((delay: number = 200) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, delay);
  }, []);

  const scrollToBottom = useCallback(() => {
    smoothScrollToBottom(100);
    setShowScrollButton(false);
  }, [smoothScrollToBottom]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isCloseToBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y < 100;
    setShowScrollButton(!isCloseToBottom);
  }, []);

  const handleSendMessage = useCallback(async (text?: string, category?: string) => {
    const messageText = text || inputText.trim();
    setInputText('');
    if (!messageText || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      item: category ? { category } : null,
      isLiked: false,
      isDisliked: false,
    };

    setMessages(prev => [...prev, userMessage]);
    Keyboard.dismiss();
    setIsLoading(true);
    setIsTypewriterComplete(true);

    try {
      const data = {
        user_question: messageText,
        ...(messages.length > 0 ? { conversation_id: messages[messages?.length - 1]?.item?.conversation_id?.$oid ?? '' } : {})
      };
      if (chatType === 'viewReport') {
        const response = await generateQuery(reportId, data);
        if (response.success) {
          console.log('viewReport response : ', response);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response.data,
            isUser: false,
            timestamp: new Date(),
            item: {
              conversation_id: {
                $oid: response?.conversation_id ?? '',
              },
            },
            conversation_id: response?.conversation_id ?? '',
            isLiked: false,
            isDisliked: false,
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          const { message } = response;
          ToastMessage(message || i18n.t('toast.failedToGenerateQuery'));
        }
      } else {
        const response = await AxiosBase.post(
          `/astrology/future_prediction${selectedUser?._id?.$oid ? `?profile_id=${selectedUser?._id?.$oid}` : ''}`,
          data,
        );
        const { result, conversation_id, coins, message_id } = response;
        setAvailableCoins(coins ?? 0);
        const botMessage: Message = {
          id: message_id ?? (Date.now() + 1).toString(),
          text: result,
          isUser: false,
          timestamp: new Date(),
          item: {
            conversation_id: {
              $oid: conversation_id ?? '',
            },
          },
          conversation_id,
          isLiked: false,
          isDisliked: false,
        };
        setMessages(prev => [...prev, botMessage]);
      }

      setIsDisableSendButton(true);
      setIsTypewriterComplete(false);
      await getWalletDetails({ silent: true });
    } catch (error: any) {
      let errorText = i18n.t('chat.requestFailed');

      if (error?.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 401) {
          errorText = i18n.t('chat.authFailed');
        } else if (status === 400) {
          errorText = i18n.t('chat.insufficientCredits');
        } else if (status === 500) {
          errorText = i18n.t('chat.serverError');
        } else {
          errorText = errorData?.message || i18n.t('chat.errorWithStatus', { status });
        }
      } else if (error?.request) {
        errorText = i18n.t('chat.networkError');
      } else {
        errorText = i18n.t('chat.sendFailed');
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        item: null,
        isLiked: false,
        isDisliked: false,
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTypewriterComplete(false);
      setInputText('');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, chatType, reportId, generateQuery, selectedUser, setAvailableCoins, getWalletDetails]);

  const handleSuggestedQuestionPress = useCallback((question: Question) => {
    handleSendMessage(question?.text, question?.category);
  }, [handleSendMessage]);

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isLastMessage = index === messages.length - 1;
    return (
      <ChatMessage
        item={item}
        chatType={chatType}
        index={index}
        previousMessage={index > 0 ? messages[index - 1].text : ''}
        typewriterOff={chatType === 'viewReport' ? false : index == messages.length - 1 && isTypewriterComplete}
        message={item.text}
        isUser={item.isUser}
        timestamp={item.timestamp}
        onTypewriterComplete={() => {
          setIsDisableSendButton(false);
          if (isLastMessage) {
            setIsTypewriterComplete(true);
          }
        }}
      />
    );
  }, [messages.length, isTypewriterComplete, chatType]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const onSendPress = useCallback(() => handleSendMessage(), [handleSendMessage]);
  const openSidePanel = useCallback(() => setSidePanelOpen(true), []);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const closeExitModal = useCallback(() => setExitChatModalVisible(false), []);
  const closeSidePanel = useCallback(() => setSidePanelOpen(false), []);
  const openExitChat = useCallback(() => setExitChatModalVisible(true), []);
  const navigateToWallet = useCallback(() => navigation.navigate(Routes.TransactionHistory), [navigation]);
  const navigateToChatHistory = useCallback(() => (navigation as any).navigate(Routes.ChatHistory), [navigation]);

  const handleExitVerify = useCallback(() => {
    if (chatHistoryEmpty) {
      (navigation as any).navigate(Routes.BottomTabNavigator, { screen: Routes.Home });
    } else {
      navigation.goBack();
    }
  }, [chatHistoryEmpty, navigation]);

  const onSelectChat = useCallback((chatId: string) => fetchChatHistory(chatId), [fetchChatHistory]);

  const baseViewStyle = useMemo(() => ({
    marginBottom: chatType !== 'viewReport' ? 0 : 0,
  }), [chatType]);

  const containerStyle = useMemo(() => ({
    marginBottom: chatType !== 'viewReport' ? inputBottomInset : 0,
  }), [chatType, inputBottomInset]);

  const titleIconView = useMemo(() => (
    <View style={{ marginLeft: scale(70) }}><TwinStars /></View>
  ), []);

  const leftComponent = useMemo(() => (
    chatType !== 'viewReport'
      ? <TouchableOpacity onPress={openSidePanel}><HamburgerMenu /></TouchableOpacity>
      : <TouchableOpacity onPress={goBack}><BackButton style={BACK_BUTTON_STYLE} /></TouchableOpacity>
  ), [chatType, openSidePanel, goBack]);

  const rightComponent = useMemo(() => (
    <View style={styles.signContainer}>
      <UserIcon sign={(selectedUser as any)?.zodiac_sign ?? ''} size={scale(40)} />
    </View>
  ), [(selectedUser as any)?.zodiac_sign]);

  const emptyState = useMemo(() => (
    <View style={[styles.emptyStateContainer, keyboardVisible && styles.emptyStateContainerKeyboardOpen]}>
      <View style={[styles.titleContainer, keyboardVisible && styles.titleContainerKeyboardOpen]}>
        <Animated.View style={sparkleStyles[0]}>
          <SmallStar height={10} width={10} />
        </Animated.View>
        <Animated.View style={[styles.star, sparkleStyles[1]]}>
          <SmallStar height={10} width={10} />
        </Animated.View>
        <Text style={styles.title}>{i18n.t('ai.ask')}</Text>
      </View>
      <Text style={styles.subtitle}>{i18n.t('ai.personal')}</Text>
      <View style={styles.suggestedQuestionsContainer}>
        <SuggestedQuestion onQuestionPress={handleSuggestedQuestionPress} />
      </View>
    </View>
  ), [keyboardVisible, sparkleStyles, handleSuggestedQuestionPress]);

  const scrollButtonBottom = inputBottomInset + (isTablet() ? 64 : verticalScale(70));

  const scrollButtonView = useMemo(() => {
    if (!showScrollButton) return null;
    return (
      <Animated.View
        style={[
          styles.scrollButtonContainer,
          { bottom: scrollButtonBottom },
          {
            opacity: scrollButtonAnim,
            transform: [
              { scale: scrollButtonAnim },
              {
                translateY: scrollButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.scrollButton} onPress={scrollToBottom} activeOpacity={0.8}>
          <Text style={styles.scrollButtonIcon}>↓</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [showScrollButton, scrollButtonAnim, scrollToBottom]);

  const exitModal = useMemo(() => (
    <ExitChatModal
      visible={exitChatModalVisible}
      closeModal={closeExitModal}
      handleVerify={handleExitVerify}
    />
  ), [exitChatModalVisible, closeExitModal, handleExitVerify]);

  const typingIndicator = useMemo(() => (
    isLoading ? <TypingIndicator message={i18n.t('chat.consultingStars')} /> : null
  ), [isLoading]);

  const horizontalSuggestions = useMemo(() => (
    !isdisablesendbutton && messages.length !== 0 && isTypewriterComplete
      ? <SuggestedQuestion horizontal onQuestionPress={handleSuggestedQuestionPress} />
      : null
  ), [isdisablesendbutton, messages.length, isTypewriterComplete, handleSuggestedQuestionPress]);

  const emptyCreditsView = useMemo(() => (
    availableCoins < LOWER_COUNT ? <EmptyCredits /> : null
  ), [availableCoins]);

  const sidePanelView = useMemo(() => (
    <ChatSidePanel
      visible={sidePanelOpen}
      onClose={closeSidePanel}
      onChatHistory={navigateToChatHistory}
      onFilters={() => {}}
      onNewChat={resetChat}
      onExitChat={openExitChat}
      onSelectChat={onSelectChat}
    />
  ), [sidePanelOpen, closeSidePanel, navigateToChatHistory, resetChat, openExitChat, onSelectChat]);

  return (
    <BaseView backgroundImage={imagepath.homeBg} style={baseViewStyle}>
      <CommonHeader
        onWalletPress={navigateToWallet}
        titleIcon={titleIconView}
        LeftComponent={leftComponent}
        RightComponent={rightComponent}
        headerStyle={styles.headerView}
        title={i18n.t('ai.ai')}
      />
      <KeyboardAvoidingView
        style={[styles.container, containerStyle]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {messages.length === 0 ? (
          emptyState
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
            {scrollButtonView}
          </>
        )}
        {exitModal}
        {typingIndicator}
        {horizontalSuggestions}
        {emptyCreditsView}
        <GradientTextInput
          placeholder={i18n.t('chat.typeMessage')}
          value={inputText}
          onChangeText={setInputText}
          disabled={availableCoins < LOWER_COUNT}
          onSendPress={onSendPress}
        />
      </KeyboardAvoidingView>
      {sidePanelView}
    </BaseView>
  );
}

export default React.memo(ChatScreen);

const styles = StyleSheet.create({
  headerView: {
    marginTop: verticalScale(10),
  },
  container: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
    justifyContent: 'center',
  },
  emptyStateContainerKeyboardOpen: {
    justifyContent: 'flex-start',
    paddingTop: verticalScale(12),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(8),
    justifyContent: 'center',
    marginTop: verticalScale(22),
  },
  titleContainerKeyboardOpen: {
    marginTop: 0,
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: fonts.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(12),
    fontFamily: fonts.regular,
    color: colors.white,
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  suggestedQuestionsContainer: {
    gap: verticalScale(12),
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    minHeight: '100%',
  },
  scrollButtonContainer: {
    position: 'absolute',
    right: scale(20),
    zIndex: 1000,
  },
  scrollButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollButtonIcon: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: colors.dark || '#000',
  },
  star: {
    position: 'absolute',
    top: 0,
    left: 34,
  },
  signContainer: {
    alignItems: 'center',
    width: scale(40),
    height: scale(40),
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: scale(40),
    marginLeft: scale(10),
  },
});
