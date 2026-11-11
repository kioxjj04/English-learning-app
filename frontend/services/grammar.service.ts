import { apiClient } from './api';
import { GrammarLesson } from '../types';

export const grammarService = {
  async getLessons(): Promise<GrammarLesson[]> {
    const res = await apiClient.get<{ success: boolean; data: GrammarLesson[] }>('/grammar/lessons');
    return res.data.data;
  },

  async getLessonDetail(lessonId: number): Promise<GrammarLesson> {
    const res = await apiClient.get<{ success: boolean; data: GrammarLesson }>(`/grammar/lesson/${lessonId}`);
    return res.data.data;
  },

  async submitLesson(lessonId: number, score: number): Promise<{ lessonId: number; score: number }> {
    const res = await apiClient.post<{ success: boolean; data: { lessonId: number; score: number } }>(
      `/grammar/lesson/${lessonId}/submit`,
      { score }
    );
    return res.data.data;
  }
};

