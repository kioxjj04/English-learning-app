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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grammarService } from '../../services/grammar.service';
import { Colors } from '../../constants/colors';

export default function GrammarDetailScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['grammarLesson', lessonId],
    queryFn: () => grammarService.getLessonDetail(Number(lessonId)),
    enabled: !!lessonId
  });

  const submitMutation = useMutation({
    mutationFn: (score: number) => grammarService.submitLesson(Number(lessonId), score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grammarLessons'] });
      queryClient.invalidateQueries({ queryKey: ['userStatistics'] });
    }
  });

  const handleSelectOption = (questionId: number, option: string) => {
    if (showResults) return; // Locked after submitting
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitPractice = () => {
    if (!lesson?.questions) return;

    const unanswered = lesson.questions.some((q) => !selectedAnswers[q.id]);
    if (unanswered) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    let correctCount = 0;
    lesson.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / lesson.questions.length) * 100);
    setShowResults(true);
    submitMutation.mutate(score);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  if (isLoading || !lesson) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const questions = lesson.questions || [];

  return (
    <View style={styles.container}>
      {/* Top Segment Control */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'theory' && styles.tabBtnActive]}
          onPress={() => setActiveTab('theory')}
        >
          <Ionicons
            name="book-outline"
            size={18}
            color={activeTab === 'theory' ? Colors.white : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'theory' && styles.tabTextActive]}>
            Theory & Rules
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'practice' && styles.tabBtnActive]}
          onPress={() => setActiveTab('practice')}
        >
          <Ionicons
            name="checkmark-done-circle-outline"
            size={18}
            color={activeTab === 'practice' ? Colors.white : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'practice' && styles.tabTextActive]}>
            Exercises ({questions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'theory' ? (
          /* Theory View */
          <View>
            <View style={styles.lessonHeaderCard}>
              <View style={styles.badgeRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{lesson.level}</Text>
                </View>
              </View>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonSummary}>{lesson.summary}</Text>
            </View>

            {/* Markdown / Formatted Content Card */}
            <View style={styles.contentCard}>
              <Text style={styles.markdownText}>{lesson.content_markdown}</Text>
            </View>

            <TouchableOpacity style={styles.startExerciseBtn} onPress={() => setActiveTab('practice')}>
              <Text style={styles.startExerciseText}>Start Practice Exercises</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          /* Practice View */
          <View>
            <View style={styles.practiceHeader}>
              <Text style={styles.practiceTitle}>Multiple Choice Exercises</Text>
              <Text style={styles.practiceSubtitle}>
                Select the correct word or structure to complete each sentence.
              </Text>
            </View>

            {questions.map((q, idx) => {
              const selected = selectedAnswers[q.id];
              const isAnswered = !!selected;

              return (
                <View key={q.id} style={styles.questionCard}>
                  <Text style={styles.questionNumber}>Question {idx + 1}:</Text>
                  <Text style={styles.questionPrompt}>{q.question}</Text>

                  {/* Options */}
                  <View style={styles.optionsList}>
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === opt;
                      let optionStyle: any = styles.optionItem;
                      let textStyle: any = styles.optionText;

                      if (showResults) {
                        if (opt === q.correct_answer) {
                          optionStyle = [styles.optionItem, styles.optionCorrect];
                          textStyle = [styles.optionText, styles.optionCorrectText];
                        } else if (isOptionSelected && opt !== q.correct_answer) {
                          optionStyle = [styles.optionItem, styles.optionWrong];
                          textStyle = [styles.optionText, styles.optionWrongText];
                        }
                      } else if (isOptionSelected) {
                        optionStyle = [styles.optionItem, styles.optionSelected];
                        textStyle = [styles.optionText, styles.optionSelectedText];
                      }

                      return (
                        <TouchableOpacity
                          key={optIdx}
                          style={optionStyle}
                          onPress={() => handleSelectOption(q.id, opt)}
                          disabled={showResults}
                        >
                          <View style={styles.optionLetterBadge}>
                            <Text style={styles.optionLetter}>
                              {String.fromCharCode(65 + optIdx)}
                            </Text>
                          </View>
                          <Text style={textStyle}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Immediate Explanation after submission */}
                  {showResults && (
                    <View style={styles.explanationBox}>
                      <View style={styles.explanationHeader}>
                        <Ionicons
                          name={
                            selected === q.correct_answer
                              ? 'checkmark-circle'
                              : 'alert-circle'
                          }
                          size={18}
                          color={selected === q.correct_answer ? Colors.success : Colors.error}
                        />
                        <Text
                          style={[
                            styles.explanationTitle,
                            {
                              color:
                                selected === q.correct_answer
                                  ? Colors.success
                                  : Colors.error
                            }
                          ]}
                        >
                          {selected === q.correct_answer ? 'Correct!' : 'Incorrect'}
                        </Text>
                      </View>
                      <Text style={styles.explanationText}>{q.explanation}</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Bottom Actions */}
            {showResults ? (
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
                <Text style={styles.retryBtnText}>Retry Exercises</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitPractice}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Answers</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 6,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10
  },
  tabBtnActive: {
    backgroundColor: Colors.primary
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 6
  },
  tabTextActive: {
    color: Colors.white
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  lessonHeaderCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  levelBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  levelText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700'
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6
  },
  lessonSummary: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20
  },
  contentCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  markdownText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text
  },
  startExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  startExerciseText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
    marginRight: 8
  },
  practiceHeader: {
    marginBottom: 16
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text
  },
  practiceSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4
  },
  questionCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4
  },
  questionPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 14
  },
  optionsList: {
    gap: 10
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
    fontSize: 14,
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
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginTop: 12
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6
  },
  explanationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700'
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 10
  },
  retryBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8
  }
});
