import { ActivityIndicator, AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { useChatStore } from '../store/useChatStore';
import { useProfileStore } from '../store/useProfileStore';

export interface Question {
  id: string;
  icon: string;
  text: string;
  category: string;
}

interface SuggestedQuestionProps {
  horizontal?: boolean;
  onQuestionPress: (question: Question) => void;
}

const SuggestedQuestion: React.FC<SuggestedQuestionProps> = ({
  horizontal = false,
  onQuestionPress,
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getQuestions } = useChatStore();
  const { selectedUser } = useProfileStore();
  const lastFetchKeyRef = useRef<string | null>(null);
  const pendingFetchUserIdRef = useRef<string | null>(null);
  const shouldRetryOnResumeRef = useRef(false);
  const isLoadingRef = useRef(false);
  const selectedUserId = (selectedUser as any)?._id?.$oid ?? '';

  const fetchQuestions = useCallback(async (
    userId: string,
    options?: { isRetry?: boolean },
  ) => {
    pendingFetchUserIdRef.current = userId;
    setLoading(true);

    try {
      const res: any = await getQuestions(userId);
      if (res.success && res.data) {
        setQuestions(res.data?.map((object: any) => ({
          text: object.question,
          category: object.category,
        })));
        lastFetchKeyRef.current = userId;
        pendingFetchUserIdRef.current = null;
        shouldRetryOnResumeRef.current = false;
      } else {
        const isCancelled =
          res.data === 'REQUEST_CANCELLED' ||
          res.message === 'REQUEST_CANCELLED';
        if (isCancelled) {
          shouldRetryOnResumeRef.current = true;
        }
      }
    } catch {
      shouldRetryOnResumeRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [getQuestions]);

  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (lastFetchKeyRef.current === selectedUserId) return;
    lastFetchKeyRef.current = selectedUserId;
    void fetchQuestions(selectedUserId);
  }, [selectedUserId, fetchQuestions]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        if (isLoadingRef.current && pendingFetchUserIdRef.current) {
          shouldRetryOnResumeRef.current = true;
        }
        return;
      }

      if (
        nextState === 'active' &&
        shouldRetryOnResumeRef.current &&
        pendingFetchUserIdRef.current
      ) {
        shouldRetryOnResumeRef.current = false;
        void fetchQuestions(pendingFetchUserIdRef.current, { isRetry: true });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchQuestions]);

  const horizontalList = useMemo(() => (
    <ScrollView horizontal contentContainerStyle={styles.horizontalWrapper}>
      {questions.map((question, idx) => (
        <TouchableOpacity key={question.id ?? idx} style={styles.horizontalcontainer} onPress={() => onQuestionPress(question)} activeOpacity={0.7}>
          <Text style={styles.text}>{question.text}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [questions, onQuestionPress]);

  const verticalList = useMemo(() => (
    <ScrollView contentContainerStyle={styles.questionsWrapper}>
      <View style={styles.questionsWrapper}>
        {questions.map((question, idx) => (
          <TouchableOpacity
            key={question.id ?? idx}
            style={styles.container}
            onPress={() => onQuestionPress(question)}
            activeOpacity={0.7}
          >
            <Text style={styles.text}>{question.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  ), [questions, onQuestionPress]);

  const loader = useMemo(() => (
    <View style={styles.loaderWrapper}>
      <ActivityIndicator size="small" color={colors.white} />
    </View>
  ), []);

  if (loading && !horizontal) {
    return loader;
  }

  if (horizontal) {
    return horizontalList;
  }

  return verticalList;
};

export default React.memo(SuggestedQuestion);

const styles = StyleSheet.create({
  loaderWrapper: {
    minHeight: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  questionsWrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: scale(6),
    marginBottom: verticalScale(14),
  },
  horizontalWrapper: {
    height: verticalScale(40),
    flexDirection: 'row',
    gap: scale(6),
    marginBottom: verticalScale(14),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(50),
    borderWidth: 0.4,
    borderColor: colors.white,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  horizontalcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    backgroundColor: colors.dusty,
  },
  icon: {
    fontSize: moderateScale(14),
  },
  text: {
    fontSize: moderateScale(14),
    fontFamily: fonts.regular,
    color: colors.white,
  },
});
