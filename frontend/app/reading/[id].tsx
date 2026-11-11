import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { practiceService } from '../../services/practice.service';
import { Colors } from '../../constants/colors';

export default function ReadingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: passage, isLoading } = useQuery({
    queryKey: ['readingPassage', id],
    queryFn: () => practiceService.getReadingDetail(Number(id)),
    enabled: !!id
  });

  const handleSubmit = () => {
    if (!passage?.questions) return;
    const unanswered = passage.questions.some((q) => !selectedAnswers[q.id]);
    if (unanswered) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    setIsSubmitted(true);
  };

  if (isLoading || !passage) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Passage Card */}
      <View style={styles.passageCard}>
        <View style={styles.badgeRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{passage.level}</Text>
          </View>
          <Text style={styles.readTime}>~3 min read</Text>
        </View>

        <Text style={styles.title}>{passage.title}</Text>
        <Text style={styles.passageText}>{passage.passage_text}</Text>
      </View>

      {/* Comprehension Questions */}
      <Text style={styles.sectionHeader}>Comprehension Questions</Text>

      {passage.questions.map((q, idx) => {
        const selected = selectedAnswers[q.id];

        return (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {idx + 1}:</Text>
            <Text style={styles.questionPrompt}>{q.question}</Text>

            <View style={styles.optionsList}>
              {q.options.map((opt, optIdx) => {
                const isSelected = selected === opt;
                let itemStyle: any = styles.optionItem;
                let textStyle: any = styles.optionText;

                if (isSubmitted) {
                  if (opt === q.correct_answer) {
                    itemStyle = [styles.optionItem, styles.optionCorrect];
                    textStyle = [styles.optionText, styles.optionCorrectText];
                  } else if (isSelected && opt !== q.correct_answer) {
                    itemStyle = [styles.optionItem, styles.optionWrong];
                    textStyle = [styles.optionText, styles.optionWrongText];
                  }
                } else if (isSelected) {
                  itemStyle = [styles.optionItem, styles.optionSelected];
                  textStyle = [styles.optionText, styles.optionSelectedText];
                }

                return (
                  <TouchableOpacity
                    key={optIdx}
                    style={itemStyle}
                    onPress={() => {
                      if (!isSubmitted) {
                        setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }));
                      }
                    }}
                    disabled={isSubmitted}
                  >
                    <View style={styles.optionLetterBadge}>
                      <Text style={styles.optionLetter}>{String.fromCharCode(65 + optIdx)}</Text>
                    </View>
                    <Text style={textStyle}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isSubmitted && (
              <View style={styles.explanationBox}>
                <Ionicons
                  name={selected === q.correct_answer ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={selected === q.correct_answer ? Colors.success : Colors.error}
                />
                <Text style={styles.explanationText}>{q.explanation}</Text>
              </View>
            )}
          </View>
        );
      })}

      {!isSubmitted ? (
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Check Answers</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setSelectedAnswers({});
            setIsSubmitted(false);
          }}
        >
          <Text style={styles.retryBtnText}>Read Again</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background
  },
  passageCard: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  levelBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  levelText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 11
  },
  readTime: {
    fontSize: 12,
    color: Colors.textMuted
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
    lineHeight: 28
  },
  passageText: {
    fontSize: 15,
    lineHeight: 26,
    color: Colors.text
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14
  },
  questionCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4
  },
  questionPrompt: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12
  },
  optionsList: {
    gap: 8
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight
  },
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight
  },
  optionWrong: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight
  },
  optionLetterBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text
  },
  optionText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1
  },
  optionSelectedText: {
    color: Colors.primary,
    fontWeight: '700'
  },
  optionCorrectText: {
    color: Colors.success,
    fontWeight: '700'
  },
  optionWrongText: {
    color: Colors.error,
    fontWeight: '700'
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceAlt,
    padding: 10,
    borderRadius: 10,
    marginTop: 10
  },
  explanationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginLeft: 6,
    flex: 1
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700'
  },
  retryBtn: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10
  },
  retryBtnText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700'
  }
});
