export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  daily_goal_minutes: number;
  streak_count: number;
  last_active_date?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: 'vocabulary' | 'grammar' | 'listening' | 'reading';
  level: string;
  total_words?: number;
  learned_words?: number;
}

export interface Vocabulary {
  id: number;
  topic_id: number;
  word: string;
  phonetic: string;
  part_of_speech: string;
  meaning_vi: string;
  example_en: string;
  example_vi: string;
  audio_url?: string;
  is_learned?: number;
  is_favorite?: number;
  review_count?: number;
}

export interface GrammarQuestion {
  id: number;
  lesson_id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface GrammarLesson {
  id: number;
  title: string;
  level: string;
  summary: string;
  content_markdown: string;
  order_index: number;
  is_completed?: number;
  user_score?: number;
  total_questions?: number;
  questions?: GrammarQuestion[];
}

export interface ListeningExercise {
  id: number;
  title: string;
  level: string;
  audio_url: string;
  duration_seconds: number;
  transcript: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

export interface ReadingPassage {
  id: number;
  title: string;
  level: string;
  passage_text: string;
  preview?: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface Quiz {
  id: number;
  title: string;
  type: 'daily_challenge' | 'standard';
  time_limit_seconds: number;
  total_questions?: number;
  highest_score?: number;
  questions?: QuizQuestion[];
}

export interface QuizReviewItem {
  id: number;
  question: string;
  selected: string;
  correct_answer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResultResponse {
  resultId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  reviewDetails: QuizReviewItem[];
}

export interface MistakeDetail {
  original: string;
  replacement: string;
  rule: string;
  explanation: string;
}

export interface VocabularySuggestion {
  word: string;
  betterAlternatives: string[];
  reason: string;
}

export interface AICorrectionResponse {
  originalText: string;
  correctedText: string;
  score: number;
  mistakes: MistakeDetail[];
  vocabularySuggestions: VocabularySuggestion[];
  overallFeedback: string;
  isMock: boolean;
}

export interface DailyStat {
  date: string;
  words_learned: number;
  lessons_completed: number;
  quiz_score_avg: number;
  study_time_minutes: number;
}

export interface UserStatistics {
  streakCount: number;
  dailyGoalMinutes: number;
  totalWordsLearned: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  averageQuizAccuracy: number;
  weeklyStats: DailyStat[];
  recentQuizzes: Array<{
    score: number;
    total_questions: number;
    time_spent_seconds: number;
    completed_at: string;
    title: string;
  }>;
}

