import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { Colors } from '../../constants/colors';

export default function ProgressScreen() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['userStatistics'],
    queryFn: userService.getStatistics
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const streak = stats?.streakCount || 1;
  const wordsLearned = stats?.totalWordsLearned || 0;
  const lessonsCompleted = stats?.totalLessonsCompleted || 0;
  const accuracy = stats?.averageQuizAccuracy || 0;
  const weeklyData = stats?.weeklyStats || [];

  // Find max study minutes for scaling the bar chart
  const maxMinutes = Math.max(30, ...weeklyData.map((d) => d.study_time_minutes));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { refetch(); }} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your learning milestones and consistency</Text>
      </View>

      {/* 4 Summary Stat Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#FFF0E5' }]}>
            <Ionicons name="flame" size={24} color="#FF6B00" />
          </View>
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statTitle}>Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="albums" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.statNumber}>{wordsLearned}</Text>
          <Text style={styles.statTitle}>Words Mastered</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-done-circle" size={24} color="#059669" />
          </View>
          <Text style={styles.statNumber}>{lessonsCompleted}</Text>
          <Text style={styles.statTitle}>Lessons Done</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="trophy" size={24} color="#D97706" />
          </View>
          <Text style={styles.statNumber}>{accuracy}%</Text>
          <Text style={styles.statTitle}>Quiz Accuracy</Text>
        </View>
      </View>

      {/* Weekly Study Activity Bar Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Daily Study Time</Text>
            <Text style={styles.chartSubtitle}>Minutes spent studying over the past 7 days</Text>
          </View>
          <Ionicons name="bar-chart-outline" size={20} color={Colors.primary} />
        </View>

        <View style={styles.chartContainer}>
          {weeklyData.map((item, index) => {
            const heightPercent = Math.max(15, Math.round((item.study_time_minutes / maxMinutes) * 100));
            const dayLabel = new Date(item.date).toLocaleDateString('en-US', { weekday: 'narrow' });

            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barMinutesText}>{item.study_time_minutes}m</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                </View>
                <Text style={styles.barLabel}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Quiz Attempts */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Quiz History</Text>

        {stats?.recentQuizzes && stats.recentQuizzes.length > 0 ? (
          stats.recentQuizzes.map((q, idx) => (
            <View key={idx} style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Ionicons
                  name={q.score >= 80 ? 'ribbon' : 'help-circle'}
                  size={22}
                  color={q.score >= 80 ? Colors.success : Colors.primary}
                />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{q.title}</Text>
                <Text style={styles.historyDate}>
                  {new Date(q.completed_at).toLocaleDateString()} • {q.time_spent_seconds}s
                </Text>
              </View>
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: q.score >= 80 ? Colors.successLight : Colors.primaryLight }
                ]}
              >
                <Text
                  style={[
                    styles.scoreBadgeText,
                    { color: q.score >= 80 ? Colors.success : Colors.primary }
                  ]}
                >
                  {q.score}%
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="school-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No quizzes taken yet. Try a quiz challenge!</Text>
          </View>
        )}
      </View>
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
    backgroundColor: Colors.background
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  chartSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10
  },
  barColumn: {
    alignItems: 'center',
    flex: 1
  },
  barMinutesText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 6
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 7
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8
  },
  historySection: {
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  historyInfo: {
    flex: 1
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '800'
  },
  emptyBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8
  }
});
