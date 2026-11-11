import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { practiceService } from '../../services/practice.service';
import { Colors } from '../../constants/colors';

export default function QuizListScreen() {
  const router = useRouter();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: practiceService.getQuizzes
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Quizzes & Challenges</Text>
        <Text style={styles.subtitle}>Test your vocabulary and grammar under timed conditions.</Text>
      </View>

      {quizzes?.map((q) => (
        <TouchableOpacity
          key={q.id}
          style={styles.quizCard}
          onPress={() => router.push(`/quiz/${q.id}`)}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={q.type === 'daily_challenge' ? 'flame' : 'help-circle'}
              size={28}
              color={q.type === 'daily_challenge' ? '#FF6B00' : Colors.primary}
            />
          </View>

          <View style={styles.quizInfo}>
            <View style={styles.tagRow}>
              <View
                style={[
                  styles.typeBadge,
                  q.type === 'daily_challenge' && styles.typeBadgeDaily
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    q.type === 'daily_challenge' && styles.typeBadgeTextDaily
                  ]}
                >
                  {q.type === 'daily_challenge' ? 'Daily Challenge' : 'Standard Quiz'}
                </Text>
              </View>
              {q.highest_score !== null && q.highest_score !== undefined && (
                <Text style={styles.highestScore}>Best: {q.highest_score}%</Text>
              )}
            </View>

            <Text style={styles.quizTitle}>{q.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{Math.round(q.time_limit_seconds / 60)} mins</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="list-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{q.total_questions || 5} questions</Text>
              </View>
            </View>
          </View>

          <Ionicons name="play" size={20} color={Colors.primary} />
        </TouchableOpacity>
      ))}
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
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  quizInfo: {
    flex: 1,
    marginRight: 10
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  typeBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  typeBadgeDaily: {
    backgroundColor: '#FFF0E5'
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary
  },
  typeBadgeTextDaily: {
    color: '#FF6B00'
  },
  highestScore: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4
  }
});

