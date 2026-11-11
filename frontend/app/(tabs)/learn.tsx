import React, { useState } from 'react';
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
import { vocabularyService } from '../../services/vocabulary.service';
import { grammarService } from '../../services/grammar.service';
import { practiceService } from '../../services/practice.service';
import { Colors } from '../../constants/colors';

type TabCategory = 'all' | 'vocabulary' | 'grammar' | 'listening' | 'reading';

export default function LearnScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('all');

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: vocabularyService.getTopics
  });

  const { data: grammarLessons, isLoading: grammarLoading } = useQuery({
    queryKey: ['grammarLessons'],
    queryFn: grammarService.getLessons
  });

  const { data: listeningExercises, isLoading: listeningLoading } = useQuery({
    queryKey: ['listeningExercises'],
    queryFn: practiceService.getListeningExercises
  });

  const { data: readingPassages, isLoading: readingLoading } = useQuery({
    queryKey: ['readingPassages'],
    queryFn: practiceService.getReadingPassages
  });

  const categories = [
    { key: 'all', label: 'All Modules' },
    { key: 'vocabulary', label: 'Vocabulary' },
    { key: 'grammar', label: 'Grammar' },
    { key: 'listening', label: 'Listening' },
    { key: 'reading', label: 'Reading' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Learning Hub</Text>
        <Text style={styles.subtitle}>Select a skill module to practice today</Text>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.categoryPill,
                selectedCategory === c.key && styles.categoryPillActive
              ]}
              onPress={() => setSelectedCategory(c.key as TabCategory)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === c.key && styles.categoryPillTextActive
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Assistant Banner */}
        {(selectedCategory === 'all' || selectedCategory === 'grammar') && (
          <TouchableOpacity
            style={styles.aiBanner}
            onPress={() => router.push('/ai-assistant')}
          >
            <View style={styles.aiBannerIcon}>
              <Ionicons name="sparkles" size={26} color={Colors.white} />
            </View>
            <View style={styles.aiBannerInfo}>
              <Text style={styles.aiBannerTitle}>AI Writing Assistant</Text>
              <Text style={styles.aiBannerDesc}>
                Instant grammar corrections, vocabulary suggestions & error breakdown.
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color={Colors.white} />
          </TouchableOpacity>
        )}

        {/* Vocabulary Section */}
        {(selectedCategory === 'all' || selectedCategory === 'vocabulary') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="albums-outline" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Vocabulary Flashcards</Text>
              </View>
            </View>

            {topicsLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              topics?.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/vocabulary/${topic.id}`)}
                >
                  <View style={styles.cardIconBox}>
                    <Ionicons name="book-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardTitle}>{topic.title}</Text>
                      <Text style={styles.levelTag}>{topic.level}</Text>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {topic.description}
                    </Text>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressText}>
                        {topic.learned_words || 0} / {topic.total_words || 0} words learned
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Grammar Section */}
        {(selectedCategory === 'all' || selectedCategory === 'grammar') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="create-outline" size={20} color="#059669" />
                <Text style={styles.sectionTitle}>Grammar Lessons</Text>
              </View>
            </View>

            {grammarLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              grammarLessons?.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/grammar/${lesson.id}`)}
                >
                  <View style={[styles.cardIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="document-text-outline" size={22} color="#059669" />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardTitle}>{lesson.title}</Text>
                      <Text style={[styles.levelTag, { color: '#059669', backgroundColor: '#ECFDF5' }]}>
                        {lesson.level}
                      </Text>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {lesson.summary}
                    </Text>
                    <View style={styles.progressRow}>
                      {lesson.is_completed ? (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                          <Text style={styles.completedText}>Completed ({lesson.user_score}%)</Text>
                        </View>
                      ) : (
                        <Text style={styles.progressText}>{lesson.total_questions || 3} practice questions</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Listening Section */}
        {(selectedCategory === 'all' || selectedCategory === 'listening') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="headset-outline" size={20} color="#D97706" />
                <Text style={styles.sectionTitle}>Listening Practice</Text>
              </View>
            </View>

            {listeningLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              listeningExercises?.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/listening/${ex.id}`)}
                >
                  <View style={[styles.cardIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="volume-high-outline" size={22} color="#D97706" />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardTitle}>{ex.title}</Text>
                      <Text style={[styles.levelTag, { color: '#D97706', backgroundColor: '#FEF3C7' }]}>
                        {ex.level}
                      </Text>
                    </View>
                    <Text style={styles.cardDesc}>Duration: ~{ex.duration_seconds} seconds</Text>
                  </View>
                  <Ionicons name="play-circle-outline" size={24} color="#D97706" />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Reading Section */}
        {(selectedCategory === 'all' || selectedCategory === 'reading') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="newspaper-outline" size={20} color="#7C3AED" />
                <Text style={styles.sectionTitle}>Reading Comprehension</Text>
              </View>
            </View>

            {readingLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              readingPassages?.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/reading/${p.id}`)}
                >
                  <View style={[styles.cardIconBox, { backgroundColor: '#EDE9FE' }]}>
                    <Ionicons name="reader-outline" size={22} color="#7C3AED" />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardTitle}>{p.title}</Text>
                      <Text style={[styles.levelTag, { color: '#7C3AED', backgroundColor: '#EDE9FE' }]}>
                        {p.level}
                      </Text>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {p.preview || 'Comprehension passage with multiple-choice questions.'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
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
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16
  },
  categoryScroll: {
    paddingBottom: 14
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 8
  },
  categoryPillActive: {
    backgroundColor: Colors.primary
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  categoryPillTextActive: {
    color: Colors.white
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  aiBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  aiBannerInfo: {
    flex: 1,
    marginRight: 10
  },
  aiBannerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4
  },
  aiBannerDesc: {
    color: '#E0E7FF',
    fontSize: 12,
    lineHeight: 16
  },
  section: {
    marginBottom: 26
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginLeft: 8
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  cardInfo: {
    flex: 1,
    marginRight: 10
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8
  },
  levelTag: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  progressText: {
    fontSize: 11,
    color: Colors.textMuted
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  completedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4
  }
});

