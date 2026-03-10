import { Platform, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import Markdown from 'react-native-markdown-display';
import moment from 'moment';
import Clipboard from '@react-native-clipboard/clipboard';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { Copy, Dislike, Like, VerticalMore } from '../constants/svgpath';
import { ToastMessage } from './ToastMessage';
import i18n from '../translation/i18n';
import { useChatStore } from '../store/useChatStore';

interface ChatMessageProps {
  item: any;
  previousMessage: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  onTypewriterComplete?: () => void;
  typewriterOff?: boolean;
}

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const Typewriter = ({ text = '', speed = Platform.OS === 'android' ? 50 : 50, onComplete }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // On Android, batch characters to reduce re-renders and compensate for JS bridge latency
  // This makes the animation feel faster and smoother on Android
  const charsPerBatch = Platform.OS === 'android' ? 3 : 1;
  const adjustedSpeed = Platform.OS === 'android' && speed > 0 
    ? Math.max(0, speed) // Use the same speed but batch characters
    : speed;

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // Batch multiple characters on Android for better performance
        const endIndex = Math.min(currentIndex + charsPerBatch, text.length);
        const batch = text.substring(currentIndex, endIndex);
        setDisplayedText(prev => prev + batch);
        setCurrentIndex(endIndex);
      }, adjustedSpeed);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length && !isComplete && text.length > 0) {
      // Typewriter animation is complete
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, adjustedSpeed, isComplete, onComplete, charsPerBatch]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <View style={{ flexDirection: 'row' }}>
      <Markdown style={markdownStyles as any}>{displayedText}</Markdown>
    </View>
  );
};


const ChatMessage: React.FC<ChatMessageProps> = ({
  item,
  message,
  previousMessage,
  isUser,
  timestamp,
  onTypewriterComplete,
  typewriterOff = false,
}) => {
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const [liked, setLiked] = useState(item?.isLiked);
  const [disliked, setDisliked] = useState(item?.isDisliked);
  const { chatLike, chatDislike } = useChatStore();
  const formatTime = (date: Date) => {
    return moment(date).format('h:mm A');
  };
  // Reset completion state when message changes
  useEffect(() => {
    setIsTypewriterComplete(false);
  }, [message]);

  const handleCopy = async () => {
    try {
      await Clipboard.setString(`Ques- ${previousMessage}\n\n Ans- ${message}`);
      ToastMessage(i18n.t('chat.copySuccess'));
    } catch (error) {
      console.error('Failed to copy message:', error);
      ToastMessage(i18n.t('chat.copyFailed'));
    }
  };

  function capitalizeFirstLetter(str: string) {
    if (!str) return "";
  
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.botContainer,
      ]}
    >
      {isUser ? (
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={[styles.message, styles.userMessage]}>{message}</Text>
          {item?.item?.category && <View style={styles.category}>
            <Text style={styles.userMessage2}>{capitalizeFirstLetter(item?.item?.category)}</Text>
          </View>}
        </View>
      ) : (
        <View style={styles.botMessageContainer}>
          {!typewriterOff ? <Text style={[styles.message, styles.userMessage]}>{message}</Text> : (      
            <Typewriter
              text={message}
              speed={1}
              onComplete={()=>{
                onTypewriterComplete?.();
                setIsTypewriterComplete(true);
              }}
            />
          )}
        </View>
      )}
      {!isUser && (
        <View style={styles.moreContainer}>
          <TouchableOpacity style={styles.moreButton} onPress={handleCopy}>
            <Copy width={scale(15)} height={scale(15)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreButton} 
            onPress={async () => {
              console.log('item on like press: ', item);
                const result = await chatLike(item?.item?.conversation_id?.$oid, item?.id);
                console.log('like result : ', result.message);
                if(result.success){
                  setLiked(true);
                  setDisliked(false);
                }
            }}
          >
            <Like 
              width={scale(15)} 
              height={scale(15)} 
              fill={liked ? colors.primary : '#737373'} 
              key={liked ? 'liked' : 'not-liked'}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.moreButton} 
            onPress={async () => {
              const result = await chatDislike(item?.item?.conversation_id?.$oid, item?.id);
                console.log('dislike result : ', result.message);
                if(result.success){
                  setDisliked(true);
                  setLiked(false);
                }
            }}
          >
            <Dislike 
              width={scale(15)} 
              height={scale(15)} 
              fill={disliked ? colors.primary : '#737373'} 
              key={disliked ? 'disliked' : 'not-disliked'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <VerticalMore width={scale(15)} height={scale(15)}  />
          </TouchableOpacity>
        </View>
      )}

      <Text
        style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.botTimestamp,
        ]}
      >
        {formatTime(timestamp)}
      </Text>
    </View >
  );
};

export default ChatMessage;

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(16),
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '85%',
    minWidth: 0,
  },
  botContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    width: '100%', // Full width for bot messages
  },
  bubble: {
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  category: {
    backgroundColor: colors.primary,
    borderRadius: moderateScale(16),
    marginTop: scale(10),
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: colors.modalbg,
    borderBottomRightRadius: moderateScale(4),
  },
  botMessageContainer: {
    width: '100%', // Full width for bot content
  },
  message: {
    fontSize: moderateScale(14),
    fontFamily: fonts.regular,
    lineHeight: moderateScale(20),
  },
  userMessage: {
    color: colors.white,
  },
  userMessage2: {
    color: colors.black,
  },
  timestamp: {
    fontSize: moderateScale(10),
    fontFamily: fonts.regular,
    marginTop: verticalScale(4),
    color: colors.gray,
  },
  userTimestamp: {
    marginRight: scale(4),
  },
  botTimestamp: {
    marginLeft: scale(4),
  },
  moreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: scale(8),
    marginTop: verticalScale(5),
  },
  moreButton: {
    padding: scale(4),
    borderRadius: moderateScale(4),
    // backgroundColor: colors.dusty,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Markdown styles for bot messages
const markdownStyles = {
  body: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontFamily: fonts.regular,
  },
  heading1: {
    color: colors.primary,
    fontSize: moderateScale(20),
    fontFamily: fonts.bold,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
  },
  heading2: {
    color: colors.primary,
    fontSize: moderateScale(18),
    fontFamily: fonts.bold,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(6),
  },
  heading3: {
    color: colors.primary,
    fontSize: moderateScale(16),
    fontFamily: fonts.semiBold,
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  strong: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  em: {
    color: colors.white,
    fontStyle: 'italic',
    fontFamily: fonts.regular,
  },
  text: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontFamily: fonts.regular,
    lineHeight: moderateScale(22),
  },
  paragraph: {
    marginBottom: verticalScale(8),
  },
  bullet_list: {
    marginVertical: verticalScale(6),
  },
  ordered_list: {
    marginVertical: verticalScale(6),
  },
  list_item: {
    marginVertical: verticalScale(3),
    flexDirection: 'row',
  },
  bullet_list_icon: {
    color: colors.primary,
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
  ordered_list_icon: {
    color: colors.primary,
    fontSize: moderateScale(13),
    fontFamily: fonts.semiBold,
    marginRight: scale(8),
  },
  blockquote: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    paddingLeft: scale(12),
    paddingVertical: verticalScale(8),
    marginVertical: verticalScale(8),
    borderRadius: moderateScale(4),
  },
  code_inline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: moderateScale(12),
    paddingHorizontal: scale(4),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  fence: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(8),
    padding: scale(12),
    marginVertical: verticalScale(8),
  },
  hr: {
    backgroundColor: colors.lightGray,
    height: 1,
    marginVertical: verticalScale(12),
  },
};
