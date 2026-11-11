import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QuizResultResponse } from '../../types';
import { Colors } from '../../constants/colors';

export default function QuizResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ resultData: string }>();

  let result: QuizResultResponse | null = null;
  try {
    if (params.resultData) {
      result = JSON.parse(params.resultData);
    }
  } catch (e) {
    console.error('Failed to parse result data:', e);
  }

  if (!result) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Result data not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPassed = result.score >= 70;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Result Hero Header */}
      <View style={styles.heroCard}>
        <View
          style={[
            styles.trophyContainer,
            { backgroundColor: isPassed ? '#DCFCE7' : '#FEF3C7' }
          ]}
        >
          <Ionicons
            name={isPassed ? 'trophy' : 'ribbon'}
            size={44}
            color={isPassed ? Colors.success : '#D97706'}
          />
        </View>

        <Text style={styles.heroTitle}>{isPassed ? 'Great Job!' : 'Keep Practicing!'}</Text>
        <Text style={styles.heroSubtitle}>
          {isPassed
            ? 'You demonstrated strong command of English vocabulary and grammar.'
            : 'Review the explanations below to turn your mistakes into lessons.'}
        </Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreNumber, { color: isPassed ? Colors.success : Colors.primary }]}>
              {result.score}%
            </Text>
            <Text style={styles.scoreLabel}>Final Score</Text>
          </View>

          <View style={styles.scoreDivider} />

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>
              {result.correctCount}/{result.totalQuestions}
            </Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>

          <View style={styles.scoreDivider} />

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>{result.timeSpentSeconds}s</Text>
            <Text style={styles.scoreLabel}>Time Spent</Text>
          </View>
        </View>
      </View>

      {/* Answer Review Section */}
      <Text style={styles.reviewHeader}>Answer Breakdown</Text>

      {result.reviewDetails.map((item, index) => (
        <View key={index} style={styles.reviewCard}>
          <View style={styles.reviewTop}>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: item.isCorrect ? Colors.successLight : Colors.errorLight }
              ]}
            >
              <Ionicons
                name={item.isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color={item.isCorrect ? Colors.success : Colors.error}
              />
              <Text
                style={[
                  styles.statusPillText,
                  { color: item.isCorrect ? Colors.success : Colors.error }
                ]}
              >
                {item.isCorrect ? 'Correct' : 'Incorrect'}
              </Text>
            </View>
            <Text style={styles.qIndex}>Q{index + 1}</Text>
          </View>

          <Text style={styles.questionText}>{item.question}</Text>

          <View style={styles.answerComparison}>
            <View style={styles.ansRow}>
              <Text style={styles.ansLabel}>Your Answer:</Text>
              <Text
                style={[
                  styles.ansValue,
                  { color: item.isCorrect ? Colors.success : Colors.error }
                ]}
              >
                {item.selected || 'No answer'}
              </Text>
            </View>

            {!item.isCorrect && (
              <View style={styles.ansRow}>
                <Text style={styles.ansLabel}>Correct Answer:</Text>
                <Text style={[styles.ansValue, { color: Colors.success, fontWeight: '700' }]}>
                  {item.correct_answer}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.explanationBox}>
            <Ionicons name="bulb-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.explanationText}>{item.explanation}</Text>
          </View>
        </View>
      ))}

      {/* Done Button */}
      <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.doneBtnText}>Return to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 20
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 20
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 14
  },
  scoreBox: {
    alignItems: 'center'
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text
  },
  scoreLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  scoreDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4
  },
  qIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 20
  },
  answerComparison: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  ansRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  ansLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 100
  },
  ansValue: {
    fontSize: 13,
    fontWeight: '600'
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10
  },
  explanationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginLeft: 6,
    flex: 1
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  errorText: {
    fontSize: 15,
    color: Colors.error,
    marginBottom: 16
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: '700'
  }
});

