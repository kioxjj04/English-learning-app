import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Pressable
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { vocabularyService } from '../../services/vocabulary.service';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function FlashcardScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reanimated 3D flip value: 0 is front, 180 is back
  const rotateY = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Fetch words for this topic
  const { data, isLoading, isError } = useQuery({
    queryKey: ['topicWords', topicId],
    queryFn: () => vocabularyService.getWordsByTopic(Number(topicId)),
    enabled: !!topicId
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: (wordId: number) => vocabularyService.toggleFavorite(wordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topicWords', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    }
  });

  // Mark learned mutation
  const learnedMutation = useMutation({
    mutationFn: ({ wordId, isLearned }: { wordId: number; isLearned: boolean }) =>
      vocabularyService.markLearned(wordId, isLearned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topicWords', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['userStatistics'] });
    }
  });

  // Flip card animation
  const handleFlip = () => {
    if (isFlipped) {
      rotateY.value = withTiming(0, { duration: 400 });
      setIsFlipped(false);
    } else {
      rotateY.value = withTiming(180, { duration: 400 });
      setIsFlipped(true);
    }
  };

  // Play pronunciation sound
  const playAudio = async (audioUrl?: string) => {
    if (!audioUrl) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (e) {
      console.warn('Audio playback failed or sound not available:', e);
    }
  };

  const nextCard = () => {
    if (!data?.words) return;
    if (isFlipped) {
      rotateY.value = 0;
      setIsFlipped(false);
    }
    setCurrentIndex((prev) => (prev + 1) % data.words.length);
  };

  const prevCard = () => {
    if (!data?.words) return;
    if (isFlipped) {
      rotateY.value = 0;
      setIsFlipped(false);
    }
    setCurrentIndex((prev) => (prev - 1 + data.words.length) % data.words.length);
  };

  // Animated styles for Front and Back
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotate = `${rotateY.value}deg`;
    const opacity = interpolate(rotateY.value, [89, 90], [1, 0]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: rotate }],
      opacity
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = `${rotateY.value + 180}deg`;
    const opacity = interpolate(rotateY.value, [89, 90], [0, 1]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: rotate }],
      opacity
    };
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !data?.words || data.words.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No vocabulary found for this topic.</Text>
      </View>
    );
  }

  const currentWord = data.words[currentIndex];
  const isFavorite = currentWord.is_favorite === 1;
  const isLearned = currentWord.is_learned === 1;

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.topInfo}>
        <Text style={styles.topicTitle}>{data.topic?.title || 'Vocabulary'}</Text>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {data.words.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / data.words.length) * 100}%` }
          ]}
        />
      </View>

      {/* 3D Flip Flashcard */}
      <View style={styles.cardArea}>
        {/* Front Card */}
        <Animated.View style={[styles.card, styles.frontCard, frontAnimatedStyle]}>
          <Pressable style={styles.cardInner} onPress={handleFlip}>
            <View style={styles.cardTopRow}>
              <View style={styles.posBadge}>
                <Text style={styles.posText}>{currentWord.part_of_speech || 'word'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => favoriteMutation.mutate(currentWord.id)}
                style={styles.actionIcon}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? Colors.error : Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.centerWordBox}>
              <Text style={styles.wordText}>{currentWord.word}</Text>
              <Text style={styles.phoneticText}>{currentWord.phonetic}</Text>

              {currentWord.audio_url && (
                <TouchableOpacity
                  style={styles.speakerBtn}
                  onPress={() => playAudio(currentWord.audio_url)}
                >
                  <Ionicons name="volume-high" size={24} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.flipHintRow}>
              <Ionicons name="sync-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.flipHint}>Tap anywhere to flip for meaning</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Back Card */}
        <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
          <Pressable style={styles.cardInner} onPress={handleFlip}>
            <View style={styles.cardTopRow}>
              <Text style={styles.backLabel}>Vietnamese Meaning</Text>
              <TouchableOpacity
                onPress={() => favoriteMutation.mutate(currentWord.id)}
                style={styles.actionIcon}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? Colors.error : Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.meaningBox}>
              <Text style={styles.meaningText}>{currentWord.meaning_vi}</Text>

              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Example:</Text>
                <Text style={styles.exampleEn}>"{currentWord.example_en}"</Text>
                <Text style={styles.exampleVi}>"{currentWord.example_vi}"</Text>
              </View>
            </View>

            <View style={styles.flipHintRow}>
              <Ionicons name="sync-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.flipHint}>Tap anywhere to flip back</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.navBtn} onPress={prevCard}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.learnedBtn,
            isLearned && styles.learnedBtnActive
          ]}
          onPress={() =>
            learnedMutation.mutate({ wordId: currentWord.id, isLearned: !isLearned })
          }
        >
          <Ionicons
            name={isLearned ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color={isLearned ? Colors.white : Colors.success}
          />
          <Text
            style={[
              styles.learnedBtnText,
              isLearned && styles.learnedBtnTextActive
            ]}
          >
            {isLearned ? 'Learned' : 'Mark as Learned'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={nextCard}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text} />
        </TouchableOpacity>
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
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text
  },
  counterText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 24
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3
  },
  cardArea: {
    height: 380,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    width: width - 40,
    height: 370,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  frontCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  backCard: {
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#F8FAFC'
  },
  cardInner: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between'
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  posBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  posText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  backLabel: {
    color: Colors.primaryDark,
    fontWeight: '700',
    fontSize: 14
  },
  actionIcon: {
    padding: 4
  },
  centerWordBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  wordText: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    textAlign: 'center'
  },
  phoneticText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic'
  },
  speakerBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18
  },
  meaningBox: {
    alignItems: 'center'
  },
  meaningText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16
  },
  exampleContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4
  },
  exampleEn: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    lineHeight: 20
  },
  exampleVi: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18
  },
  flipHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flipHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28
  },
  navBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  learnedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#86EFAC'
  },
  learnedBtnActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success
  },
  learnedBtnText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8
  },
  learnedBtnTextActive: {
    color: Colors.white
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary
  }
});

