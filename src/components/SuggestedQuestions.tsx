import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { moderateScale, scale, verticalScale } from '../utils/scale';
import { colors } from '../constants/colors';
import { fonts, suggestedQuestions } from '../constants/fonts';
import { useChatStore } from '../store/useChatStore';

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
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    getQuestions().then((res: any) => {
      console.log('Questions data : ', res);
      if (res.success && res.data) {
        setQuestions(res.data?.map((object: any) => ({ text: object.question, category: object.category })));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  if (loading && !horizontal) {
    return (
      <View style={styles.loaderWrapper}>
        <ActivityIndicator size="small" color={colors.white} />
      </View>
    );
  }

  if (horizontal) {
    return (
      <ScrollView horizontal contentContainerStyle={styles.horizontalWrapper}>
        {questions.map(question => (
          <TouchableOpacity key={question.id} style={styles.horizontalcontainer} onPress={() => onQuestionPress(question)} activeOpacity={0.7}>
            {/* <Text style={styles.icon}>{question.icon}</Text> */}
            <Text style={styles.text}>{question.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.questionsWrapper}>
      <View style={styles.questionsWrapper}>
        {questions.map(question => (
          <TouchableOpacity
            key={question.id}
            style={styles.container}
            onPress={() => onQuestionPress(question)}
            activeOpacity={0.7}
          >
            {/* <Text style={styles.icon}>{question.icon}</Text> */}
            <Text style={styles.text}>{question.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default SuggestedQuestion;

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
    // backgroundColor: colors.black,
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
