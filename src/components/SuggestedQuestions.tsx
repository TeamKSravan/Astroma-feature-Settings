import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const fetchQuestions = useCallback(async (userId: string) => {
    setLoading(true);
    getQuestions(userId).then((res: any) => {
      if (res.success && res.data) {
        setQuestions(res.data?.map((object: any) => ({ text: object.question, category: object.category })));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [getQuestions]);

  useEffect(() => {
    const userId = selectedUser?._id?.$oid ?? '';
    if (lastFetchKeyRef.current === userId) return;
    lastFetchKeyRef.current = userId;
    fetchQuestions(userId);
  }, [selectedUser?._id?.$oid, fetchQuestions]);

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
