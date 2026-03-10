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
import React, { useState, useRef, useEffect, useCallback } from 'react';
import imagepath from '../../../constants/imagepath';
import { HamburgerMenu, SmallStar, TwinStars } from '../../../constants/svgpath';
import { UserIcon } from '../../../components/UserList';
import i18n from '../../../translation/i18n';
import { moderateScale, scale, verticalScale } from '../../../utils/scale';
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  item: any;
  category: string;
}

export default function ChatScreen(props: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isdisablesendbutton, setIsDisableSendButton] = useState(false);
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;
  const smallStar1 = useRef(new Animated.Value(0)).current;
  const smallStar2 = useRef(new Animated.Value(0)).current;
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [exitChatModalVisible, setExitChatModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const { generateQuery, getChatMessageHistory } = useChatStore();
  const navigation = useNavigation();
  const { chatType, reportId, report, chatHistoryId, chatHistoryEmpty } = props.route.params || { chatType: null, reportId: null, report: null, chatHistoryId: null, chatHistoryEmpty: false };
  const { selectedUser } = useProfileStore();
  const { getWalletDetails, availableCoins, setAvailableCoins } = useWalletStore();
  const openModal = () => {
    setFilterModalVisible(true);
  };

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

  // Clear chat when selected user (profile) changes
  const selectedUserId = (selectedUser as any)?._id?.$oid ?? null;
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    resetChat();
  }, [selectedUserId]);


  const createSparkleAnimation = (animValue: Animated.Value, delay: number) => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.25,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.75,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  };
  const createElementStyle = (animValue: Animated.Value) => {
    const opacity = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.4, 1, 0.5],
    });
    const scale = animValue.interpolate({
      inputRange: [0, 0.75, 1, 1.25],
      outputRange: [0, 0.7, 1, 1.2],
    });
    return { opacity, transform: [{ scale }] };
  };
  useEffect(() => {
    createSparkleAnimation(smallStar1, 0);
    createSparkleAnimation(smallStar2, 300);
  }, []);

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

  const fetchChatHistory = async (chatHistoryId: string) => {
    const result = await getChatMessageHistory(chatHistoryId, (selectedUser as any)?._id?.$oid ?? '');
    console.log('result from fetchChatHistory: ', result.data);
    if (result.success && result.data) {
      const mappedMessages = result.data?.map((item: any) => ({
        id: item?._id?.$oid,
        text: item?.message.trim(),
        isUser: item?.role == 'user' ? true : false,
        timestamp: item?.created_at ? new Date(item.created_at?.$date) : new Date(),
        item: item,
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
  }

  useEffect(() => {
    if (chatType === 'viewReport') {
      setMessages(report?.messages?.map((item: any, index: number) => ({ id: index, text: item?.content, isUser: item?.role == 'user' ? true : false, timestamp: new Date(), item: item })));
      setIsDisableSendButton(false);
    }
    if (chatType === 'report') {
      console.log('useEffect report : ', report);
      setMessages([{ id: '1', text: report.data, isUser: false, timestamp: new Date(), item: item }]);
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
      // Debounce scroll to avoid too frequent updates
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
  }, [setMessages, setInputText, setIsLoading]);

  const handleSendMessage = async (text?: string, category?: string) => {
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
      if (chatType === 'report') {
        const response = await generateQuery(reportId, data);
        console.log('report chat response : ', response);
        if (response.success) {
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
            isLiked: false,
            isDisliked: false,
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          const { message } = response;
          ToastMessage(message || 'Failed to generate query');
        }
      } else {
        const response = await AxiosBase.post(
          `/astrology/future_prediction${selectedUser?._id?.$oid ? `?profile_id=${selectedUser?._id?.$oid}` : ''}`,
          data,
        );
        const { result, conversation_id, coins, message_id } = response;
        setAvailableCoins(coins);
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
          isLiked: false,
          isDisliked: false,
        };
        setMessages(prev => [...prev, botMessage]);
      }

      setIsDisableSendButton(true);
      setIsTypewriterComplete(false);
      await getWalletDetails({ silent: true });
    } catch (error: any) {
      console.error('Error sending message:', error);

      let errorText =
        "Sorry, I couldn't process your request. Please try again.";

      if (error?.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.error('Error Response:', errorData);
        console.error('Status Code:', status);

        if (status === 401) {
          errorText = 'Authentication failed. Please login again.';
        } else if (status === 400) {
          errorText =
            errorData?.message || 'Invalid request. Please try again.';
        } else if (status === 500) {
          errorText = 'Server error. Please try again later.';
        } else {
          errorText = errorData?.message || `Error: ${status}`;
        }
      } else if (error?.request) {
        console.error('No response received:', error.request);
        errorText = 'Network error. Please check your internet connection.';
      } else {
        console.error('Request setup error:', error.message);
        errorText = 'Failed to send message. Please try again.';
      }

      // Add error message to chat
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
  };

  const handleSuggestedQuestionPress = (question: Question) => {
    handleSendMessage(question?.text, question?.category);
  };

  const smoothScrollToBottom = (delay: number = 200) => {
    // Clear any existing scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Use progressive scrolling for smoother effect
    scrollTimeoutRef.current = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, delay);
  };

  const scrollToBottom = () => {
    smoothScrollToBottom(100);
    setShowScrollButton(false);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isCloseToBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y < 100;

    setShowScrollButton(!isCloseToBottom && messages.length > 0);
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyStateContainer, keyboardVisible && styles.emptyStateContainerKeyboardOpen]}>
      <View style={[styles.titleContainer, keyboardVisible && styles.titleContainerKeyboardOpen]}>
        <Animated.View style={createElementStyle(smallStar1)}>
          <SmallStar height={10} width={10} />
        </Animated.View>
        <Animated.View style={[styles.star, createElementStyle(smallStar2)]}>
          <SmallStar height={10} width={10} />
        </Animated.View>

        <Text style={styles.title}>{i18n.t('ai.ask')}</Text>
      </View>
      <Text style={styles.subtitle}>{i18n.t('ai.personal')}</Text>

      <View style={styles.suggestedQuestionsContainer}>
        <SuggestedQuestion onQuestionPress={handleSuggestedQuestionPress} />
      </View>
    </View>
  );

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isLastMessage = index === messages.length - 1;

    return (
      <ChatMessage
        item={item}
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
  },
    [messages.length, isTypewriterComplete, chatType]
  );

  return (
    <BaseView backgroundImage={imagepath.homeBg} style={{ marginBottom: chatType !== 'viewReport' ? verticalScale(50) : 0 }}>
      <CommonHeader
        onWalletPress={() => navigation.navigate('Wallet', { showBack: true })}
        titleIcon={<View style={{ marginLeft: scale(70) }}><TwinStars /></View>}
        LeftComponent={
          chatType !== 'viewReport' ?
            <TouchableOpacity onPress={() => setSidePanelOpen(true)}>
              <HamburgerMenu />
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <BackButton style={{
                position: 'relative',
                left: scale(0),
                width: scale(24),
                height: scale(24),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.modalbg,
                borderRadius: scale(5),
              }} />
            </TouchableOpacity>
        }
        RightComponent={
          <View style={styles.signContainer}>
            <UserIcon sign={(selectedUser as any)?.zodiac_sign ?? ''} size={scale(40)} />
          </View>
        }
        headerStyle={styles.headerView}
        title={i18n.t('ai.ai')}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 50}
      >
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item, index }) => renderMessage({ item, index })}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />

            {showScrollButton && (
              <Animated.View
                style={[
                  styles.scrollButtonContainer,
                  {
                    opacity: scrollButtonAnim,
                    transform: [
                      {
                        scale: scrollButtonAnim,
                      },
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
                <TouchableOpacity
                  style={styles.scrollButton}
                  onPress={scrollToBottom}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scrollButtonIcon}>↓</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </>
        )}
        <ExitChatModal
          visible={exitChatModalVisible}
          closeModal={() => setExitChatModalVisible(false)}
          handleVerify={() => {
            if (chatHistoryEmpty) {
              (navigation as any).navigate('BottomTabNavigator', { screen: 'Horoscope' });
            } else {
              navigation.goBack();
            }
          }}
        />

        {isLoading && <TypingIndicator message={i18n.t('chat.consultingStars')} />}
        {!isdisablesendbutton && messages.length !== 0 && isTypewriterComplete && <SuggestedQuestion horizontal onQuestionPress={handleSuggestedQuestionPress} />}
        {availableCoins < 1 && <EmptyCredits />}
        <GradientTextInput
          placeholder={i18n.t('chat.typeMessage')}
          value={inputText}
          onChangeText={setInputText}
          onSendPress={() => handleSendMessage()}
        />
      </KeyboardAvoidingView>

      <ChatSidePanel
        visible={sidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        onChatHistory={() => (navigation as any).navigate('ChatHistory')}
        onFilters={openModal}
        onNewChat={resetChat}
        onExitChat={() => setExitChatModalVisible(true)}
        onSelectChat={(chatId) => fetchChatHistory(chatId)}
      />

    </BaseView>
  );
}

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
    bottom: verticalScale(100),
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
