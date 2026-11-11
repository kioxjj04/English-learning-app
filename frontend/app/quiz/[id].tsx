import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { practiceService } from '../../services/practice.service';
import { Colors } from '../../constants/colors';

export default function ActiveQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<any>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quizDetail', id],
    queryFn: () => practiceService.getQuizDetail(Number(id)),
    enabled: !!id
  });

  // Initialize timer when quiz loads
  useEffect(() => {
    if (quiz) {
      setTimeLeft(quiz.time_limit_seconds || 300);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz]);

  const handleSelectOption = (questionId: number, option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleAutoSubmit = async () => {
    Alert.alert('Time Up!', 'Your quiz is being automatically submitted.');
    await executeSubmit();
  };

  const executeSubmit = async () => {
    if (!quiz) return;
    try {
      setIsSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpent = (quiz.time_limit_seconds || 300) - timeLeft;
      const result = await practiceService.submitQuiz(Number(id), userAnswers, timeSpent);

      router.replace({
        pathname: '/quiz/result',
        params: { resultData: JSON.stringify(result) }
      });
    } catch (err: any) {
      Alert.alert('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    const questions = quiz?.questions || [];
    const answeredCount = Object.keys(userAnswers).length;

    Alert.alert(
      'Submit Quiz',
      `You have answered ${answeredCount} of ${questions.length} questions. Are you ready to submit?`,
      [
        { text: 'Review', style: 'cancel' },
        { text: 'Submit', onPress: executeSubmit }
      ]
    );
  };

  if (isLoading || !quiz) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeCritical = timeLeft < 30;

  return (
    <View style={styles.container}>
      {/* Top Header with Timer */}
      <View style={styles.topHeader}>
        <View style={styles.questionCounter}>
          <Text style={styles.counterText}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
        </View>

        <View style={[styles.timerBadge, isTimeCritical && styles.timerBadgeAlert]}>
          <Ionicons
            name="timer-outline"
            size={18}
            color={isTimeCritical ? Colors.error : Colors.primary}
          />
          <Text style={[styles.timerText, isTimeCritical && styles.timerTextAlert]}>
            {minutes}:{seconds < 10 ? '0' : ''}
            {seconds}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / questions.length) * 100}%` }
          ]}
        />
      </View>

      {/* Question Card */}
      <View style={styles.card}>
        <Text style={styles.prompt}>{currentQ.question}</Text>

        <View style={styles.optionsList}>
          {currentQ.options.map((opt, idx) => {
            const isSelected = userAnswers[currentQ.id] === opt;

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionItem, isSelected && styles.optionSelected]}
                onPress={() => handleSelectOption(currentQ.id, opt)}
              >
                <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
                  <Text style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Nav Controls */}
      <View style={styles.footerControls}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.prevBtn]}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        >
          <Ionicons name="arrow-back" size={18} color={currentIndex === 0 ? Colors.textMuted : Colors.text} />
          <Text style={[styles.prevBtnText, currentIndex === 0 && { color: Colors.textMuted }]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.footerBtn, styles.submitBtn]}
            onPress={confirmSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>Finish & Submit</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.footerBtn, styles.nextBtn]}
            onPress={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  questionCounter: {
    flex: 1
  },
  counterText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  timerBadgeAlert: {
    backgroundColor: Colors.errorLight
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 6
  },
  timerTextAlert: {
    color: Colors.error
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-between'
  },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 20
  },
  optionsList: {
    gap: 12,
    marginBottom: 16
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  optionBadgeSelected: {
    backgroundColor: Colors.primary
  },
  optionLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text
  },
  optionLetterSelected: {
    color: Colors.white
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1
  },
  optionTextSelected: {
    fontWeight: '700',
    color: Colors.primaryDark
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    gap: 12
  },
  footerBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  prevBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border
  },
  prevBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 6
  },
  nextBtn: {
    backgroundColor: Colors.primary
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 6
  },
  submitBtn: {
    backgroundColor: Colors.success
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white
  }
});
