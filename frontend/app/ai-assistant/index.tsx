import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../services/ai.service';
import { AICorrectionResponse } from '../../types';
import { Colors } from '../../constants/colors';

export default function AIAssistantScreen() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AICorrectionResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (text: string) => aiService.correctWriting(text),
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (err: any) => {
      Alert.alert('Analysis Failed', err.message || 'Could not analyze your writing.');
    }
  });

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      Alert.alert('Empty Input', 'Please type or paste an English paragraph to check.');
      return;
    }
    mutation.mutate(inputText);
  };

  const loadSample = () => {
    setInputText(
      'I am agree with you. He go to school everyday and he study alot of good books to prepare for his career.'
    );
    setResult(null);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="sparkles" size={24} color={Colors.white} />
          </View>
          <View style={styles.introInfo}>
            <Text style={styles.introTitle}>AI Writing Tutor</Text>
            <Text style={styles.introSubtitle}>
              Receive grammar corrections, vocabulary enhancements, and explanation of mistakes.
            </Text>
          </View>
        </View>

        {/* Input Box */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Your Paragraph</Text>
            <TouchableOpacity onPress={loadSample}>
              <Text style={styles.sampleLink}>Paste Sample</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Type or paste your English text here..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={inputText}
            onChangeText={setInputText}
            maxLength={1000}
          />

          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>{inputText.length} / 1000 characters</Text>
            {inputText.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.analyzeBtn, mutation.isPending && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.white} />
                <Text style={styles.loadingText}>Analyzing grammar & style...</Text>
              </View>
            ) : (
              <View style={styles.loadingRow}>
                <Ionicons name="flash" size={18} color={Colors.white} />
                <Text style={styles.analyzeBtnText}>Check Writing</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.resultsArea}>
            {/* Score & Teacher Feedback Card */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <View>
                  <Text style={styles.scoreLabel}>Writing Quality</Text>
                  <Text style={styles.scoreComment}>
                    {result.score >= 80 ? 'Well Structured' : 'Needs Revisions'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.scoreBadge,
                    {
                      backgroundColor:
                        result.score >= 80 ? Colors.successLight : Colors.primaryLight
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreNumber,
                      { color: result.score >= 80 ? Colors.success : Colors.primary }
                    ]}
                  >
                    {result.score}/100
                  </Text>
                </View>
              </View>

              <Text style={styles.overallFeedback}>"{result.overallFeedback}"</Text>
            </View>

            {/* Corrected Text Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.resultTitle}>Improved Version</Text>
              </View>
              <Text style={styles.correctedText}>{result.correctedText}</Text>
            </View>

            {/* Mistakes Breakdown */}
            {result.mistakes && result.mistakes.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>
                  Grammar Mistakes ({result.mistakes.length})
                </Text>

                {result.mistakes.map((m, idx) => (
                  <View key={idx} style={styles.mistakeCard}>
                    <View style={styles.mistakeTop}>
                      <View style={styles.ruleBadge}>
                        <Text style={styles.ruleText}>{m.rule}</Text>
                      </View>
                    </View>

                    <View style={styles.comparisonBox}>
                      <View style={styles.diffRow}>
                        <Text style={styles.diffLabel}>Original:</Text>
                        <Text style={styles.diffOriginal}>"{m.original}"</Text>
                      </View>
                      <View style={styles.diffRow}>
                        <Text style={styles.diffLabel}>Corrected:</Text>
                        <Text style={styles.diffCorrected}>"{m.replacement}"</Text>
                      </View>
                    </View>

                    <Text style={styles.mistakeDesc}>💡 {m.explanation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Vocabulary Suggestions */}
            {result.vocabularySuggestions && result.vocabularySuggestions.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>Vocabulary Enhancements</Text>

                {result.vocabularySuggestions.map((v, idx) => (
                  <View key={idx} style={styles.vocabCard}>
                    <View style={styles.vocabTop}>
                      <Text style={styles.vocabWord}>Instead of "{v.word}":</Text>
                    </View>
                    <View style={styles.alternativesRow}>
                      {v.betterAlternatives.map((alt, aIdx) => (
                        <View key={aIdx} style={styles.altPill}>
                          <Text style={styles.altText}>{alt}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.vocabReason}>{v.reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  introInfo: {
    flex: 1
  },
  introTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2
  },
  introSubtitle: {
    color: '#E0E7FF',
    fontSize: 12,
    lineHeight: 16
  },
  inputCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  inputTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text
  },
  sampleLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary
  },
  textArea: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 120,
    lineHeight: 20
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted
  },
  clearText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600'
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  analyzeBtnDisabled: {
    opacity: 0.7
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8
  },
  analyzeBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 6
  },
  resultsArea: {
    marginTop: 6
  },
  scoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  scoreLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  scoreComment: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2
  },
  scoreBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '800'
  },
  overallFeedback: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.success,
    marginLeft: 6
  },
  correctedText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '500'
  },
  sectionBlock: {
    marginTop: 8,
    marginBottom: 12
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10
  },
  mistakeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  mistakeTop: {
    flexDirection: 'row',
    marginBottom: 10
  },
  ruleBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  ruleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error
  },
  comparisonBox: {
    backgroundColor: Colors.surfaceAlt,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8
  },
  diffRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  diffLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 75
  },
  diffOriginal: {
    fontSize: 13,
    color: Colors.error,
    textDecorationLine: 'line-through'
  },
  diffCorrected: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '700'
  },
  mistakeDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16
  },
  vocabCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  vocabTop: {
    marginBottom: 8
  },
  vocabWord: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  alternativesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  altPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  altText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED'
  },
  vocabReason: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16
  }
});

