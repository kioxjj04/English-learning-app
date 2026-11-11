import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { vocabularyService } from '../../services/vocabulary.service';
import { userService } from '../../services/user.service';
import { Colors } from '../../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, refreshUser } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/(auth)/login');
    }
  }, [token, authLoading]);

  // Fetch topics
  const {
    data: topics,
    isLoading: topicsLoading,
    refetch: refetchTopics
  } = useQuery({
    queryKey: ['topics'],
    queryFn: vocabularyService.getTopics,
    enabled: !!token
  });

  // Fetch statistics
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['statistics'],
    queryFn: userService.getStatistics,
    enabled: !!token
  });

  const onRefresh = async () => {
    await Promise.all([refetchTopics(), refetchStats(), refreshUser()]);
  };

  if (authLoading || (!token && !user)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const streak = user?.streak_count || stats?.streakCount || 1;
  const goalMinutes = user?.daily_goal_minutes || 15;
  const wordsLearned = stats?.totalWordsLearned || 0;
  const lessonsCompleted = stats?.totalLessonsCompleted || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={topicsLoading || statsLoading} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar Greeting */}
      <View style={styles.topBar}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingSubtitle}>Welcome back,</Text>
          <Text style={styles.greetingTitle}>{user?.full_name || 'Student'} 👋</Text>
        </View>

        <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/(tabs)/profile')}>
          <Image
            source={{
              uri:
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Streak & Goal Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.streakBox}>
          <View style={styles.fireIconContainer}>
            <Ionicons name="flame" size={26} color="#FF6B00" />
          </View>
          <View>
            <Text style={styles.statValue}>{streak} Days</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.streakBox}>
          <View style={[styles.fireIconContainer, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="time" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{goalMinutes} mins</Text>
            <Text style={styles.statLabel}>Daily Target</Text>
          </View>
        </View>
      </View>

      {/* Daily Vocabulary Spotlight */}
      <View style={styles.spotlightCard}>
        <View style={styles.spotlightBadge}>
          <Ionicons name="sparkles" size={14} color={Colors.primary} />
          <Text style={styles.spotlightBadgeText}>Word of the Day</Text>
        </View>

        <Text style={styles.spotlightWord}>Resilience</Text>
        <Text style={styles.spotlightPhonetic}>/rɪˈzɪliəns/ • noun</Text>
        <Text style={styles.spotlightMeaning}>Khả năng phục hồi, kiên cường vượt qua thử thách.</Text>
        <Text style={styles.spotlightExample}>
          "Success in university requires mental resilience and consistent effort."
        </Text>

        <TouchableOpacity
          style={styles.spotlightButton}
          onPress={() => router.push('/vocabulary/2')} // Topic 2
        >
          <Text style={styles.spotlightButtonText}>Practice Flashcards</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Quick Action Grid */}
      <Text style={styles.sectionTitle}>Learning Hub</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: '#EEF2FF' }]}
          onPress={() => router.push('/(tabs)/learn')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#C7D2FE' }]}>
            <Ionicons name="albums" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.quickCardTitle}>Vocabulary</Text>
          <Text style={styles.quickCardSub}>{wordsLearned} learned</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: '#ECFDF5' }]}
          onPress={() => router.push('/grammar/1')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#A7F3D0' }]}>
            <Ionicons name="create" size={24} color="#059669" />
          </View>
          <Text style={styles.quickCardTitle}>Grammar</Text>
          <Text style={styles.quickCardSub}>{lessonsCompleted} completed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: '#FEF3C7' }]}
          onPress={() => router.push('/listening/1')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#FDE68A' }]}>
            <Ionicons name="headset" size={24} color="#D97706" />
          </View>
          <Text style={styles.quickCardTitle}>Listening</Text>
          <Text style={styles.quickCardSub}>Audio & Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: '#FCE7F3' }]}
          onPress={() => router.push('/ai-assistant')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#FBCFE8' }]}>
            <Ionicons name="bulb" size={24} color="#DB2777" />
          </View>
          <Text style={styles.quickCardTitle}>AI Assistant</Text>
          <Text style={styles.quickCardSub}>Smart review</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Challenge Card */}
      <View style={styles.challengeCard}>
        <View style={styles.challengeInfo}>
          <View style={styles.challengeTag}>
            <Text style={styles.challengeTagText}>DAILY CHALLENGE</Text>
          </View>
          <Text style={styles.challengeTitle}>5-Minute Quick English Boost</Text>
          <Text style={styles.challengeDesc}>Test your vocabulary & grammar speed to keep your streak alive!</Text>
        </View>

        <TouchableOpacity style={styles.challengeBtn} onPress={() => router.push('/quiz/1')}>
          <Text style={styles.challengeBtnText}>Start</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Vocabulary Topics */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Vocabulary Topics</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/learn')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {topics &&
        topics.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.topicRow}
            onPress={() => router.push(`/vocabulary/${t.id}`)}
          >
            <View style={styles.topicIconContainer}>
              <Ionicons name="book-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.topicDetails}>
              <View style={styles.topicTitleRow}>
                <Text style={styles.topicTitle}>{t.title}</Text>
                <Text style={styles.topicLevelBadge}>{t.level}</Text>
              </View>
              <Text style={styles.topicDesc} numberOfLines={1}>
                {t.description}
              </Text>
              <View style={styles.topicProgressBar}>
                <View
                  style={[
                    styles.topicProgressFill,
                    {
                      width: `${
                        t.total_words ? Math.round(((t.learned_words || 0) / t.total_words) * 100) : 0
                      }%`
                    }
                  ]}
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greetingContainer: {
    flex: 1
  },
  greetingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    overflow: 'hidden'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  fireIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  spotlightCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  spotlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  spotlightBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4
  },
  spotlightWord: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  spotlightPhonetic: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic'
  },
  spotlightMeaning: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6
  },
  spotlightExample: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18
  },
  spotlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12
  },
  spotlightButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  quickCard: {
    width: '48%',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  quickCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text
  },
  quickCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 26
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12
  },
  challengeTag: {
    backgroundColor: '#3730A3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  challengeTagText: {
    color: '#E0E7FF',
    fontSize: 10,
    fontWeight: '800'
  },
  challengeTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  challengeDesc: {
    color: '#C7D2FE',
    fontSize: 12,
    lineHeight: 16
  },
  challengeBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  challengeBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  topicIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  topicDetails: {
    flex: 1,
    marginRight: 10
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text
  },
  topicLevelBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  topicDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8
  },
  topicProgressBar: {
    height: 5,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden'
  },
  topicProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3
  }
});

