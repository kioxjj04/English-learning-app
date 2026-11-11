import React, { useState, useEffect } from 'react';
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
import { Audio } from 'expo-av';
import { practiceService } from '../../services/practice.service';
import { Colors } from '../../constants/colors';

export default function ListeningDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['listeningExercise', id],
    queryFn: () => practiceService.getListeningDetail(Number(id)),
    enabled: !!id
  });

  // Load audio
  useEffect(() => {
    let soundObj: Audio.Sound | null = null;

    async function loadAudio() {
      if (!exercise?.audio_url) return;
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: exercise.audio_url },
          { shouldPlay: false }
        );

        soundObj = newSound;
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPositionMillis(status.positionMillis);
            setDurationMillis(status.durationMillis || 1);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              newSound.setPositionAsync(0);
            }
          }
        });
      } catch (err) {
        console.warn('Could not load listening audio:', err);
      }
    }

    loadAudio();

    return () => {
      if (soundObj) {
        soundObj.unloadAsync();
      }
    };
  }, [exercise?.audio_url]);

  const togglePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleReplay = async () => {
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  };

  const formatTime = (millis: number) => {
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = () => {
    if (!exercise?.questions) return;
    const unanswered = exercise.questions.some((q) => !selectedAnswers[q.id]);
    if (unanswered) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    setIsSubmitted(true);
  };

  if (isLoading || !exercise) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const progressPercent = Math.min(100, (positionMillis / durationMillis) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Exercise Header */}
      <View style={styles.headerCard}>
        <View style={styles.levelTag}>
          <Text style={styles.levelText}>{exercise.level}</Text>
        </View>
        <Text style={styles.title}>{exercise.title}</Text>
        <Text style={styles.desc}>Listen attentively to the audio track and answer the questions below.</Text>
      </View>

      {/* Audio Player Card */}
      <View style={styles.playerCard}>
        <View style={styles.playerTop}>
          <Ionicons name="musical-notes" size={20} color={Colors.primary} />
          <Text style={styles.playerTime}>
            {formatTime(positionMillis)} / {formatTime(durationMillis)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.trackBar}>
          <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
        </View>

        {/* Player Controls */}
        <View style={styles.playerControls}>
          <TouchableOpacity style={styles.secondaryControl} onPress={handleReplay}>
            <Ionicons name="reload" size={20} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={Colors.white}
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryControl}
            onPress={() => setShowTranscript(!showTranscript)}
          >
            <Ionicons
              name={showTranscript ? 'document-text' : 'document-text-outline'}
              size={20}
              color={showTranscript ? Colors.primary : Colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Transcript Toggle Box */}
        {showTranscript && (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptTitle}>Audio Transcript:</Text>
            <Text style={styles.transcriptText}>{exercise.transcript}</Text>
          </View>
        )}
      </View>

      {/* Questions Section */}
      <Text style={styles.sectionHeader}>Comprehension Questions</Text>

      {exercise.questions.map((q, idx) => {
        const selected = selectedAnswers[q.id];

        return (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {idx + 1}:</Text>
            <Text style={styles.questionText}>{q.question}</Text>

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
                <Text style={styles.explanationText}>💡 {q.explanation}</Text>
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
          <Text style={styles.retryBtnText}>Practice Again</Text>
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
  headerCard: {
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
  levelTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  levelText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 11
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6
  },
  desc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18
  },
  playerCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  playerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  playerTime: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  trackBar: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 18
  },
  trackFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24
  },
  secondaryControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  transcriptBox: {
    backgroundColor: Colors.surfaceAlt,
    padding: 14,
    borderRadius: 14,
    marginTop: 18
  },
  transcriptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6
  },
  transcriptText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20
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
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
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
    backgroundColor: Colors.surfaceAlt,
    padding: 10,
    borderRadius: 10,
    marginTop: 10
  },
  explanationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16
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
