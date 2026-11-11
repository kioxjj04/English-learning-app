import { apiClient } from './api';
import { ListeningExercise, ReadingPassage, Quiz, QuizResultResponse } from '../types';

export const practiceService = {
  // Listening
  async getListeningExercises(): Promise<ListeningExercise[]> {
    const res = await apiClient.get<{ success: boolean; data: ListeningExercise[] }>('/listening/exercises');
    return res.data.data;
  },

  async getListeningDetail(id: number): Promise<ListeningExercise> {
    const res = await apiClient.get<{ success: boolean; data: ListeningExercise }>(`/listening/exercise/${id}`);
    return res.data.data;
  },

  // Reading
  async getReadingPassages(): Promise<ReadingPassage[]> {
    const res = await apiClient.get<{ success: boolean; data: ReadingPassage[] }>('/reading/passages');
    return res.data.data;
  },

  async getReadingDetail(id: number): Promise<ReadingPassage> {
    const res = await apiClient.get<{ success: boolean; data: ReadingPassage }>(`/reading/passage/${id}`);
    return res.data.data;
  },

  // Quiz
  async getQuizzes(): Promise<Quiz[]> {
    const res = await apiClient.get<{ success: boolean; data: Quiz[] }>('/quiz/all');
    return res.data.data;
  },

  async getQuizDetail(id: number): Promise<Quiz> {
    const res = await apiClient.get<{ success: boolean; data: Quiz }>(`/quiz/${id}`);
    return res.data.data;
  },

  async submitQuiz(
    quizId: number,
    userAnswers: Record<number, string>,
    timeSpentSeconds: number
  ): Promise<QuizResultResponse> {
    const res = await apiClient.post<{ success: boolean; data: QuizResultResponse }>(`/quiz/${quizId}/submit`, {
      userAnswers,
      timeSpentSeconds
    });
    return res.data.data;
  }
};

