import { apiClient } from './api';
import { Topic, Vocabulary } from '../types';

export const vocabularyService = {
  async getTopics(): Promise<Topic[]> {
    const res = await apiClient.get<{ success: boolean; data: Topic[] }>('/vocabulary/topics');
    return res.data.data;
  },

  async getWordsByTopic(topicId: number): Promise<{ topic: Topic; words: Vocabulary[] }> {
    const res = await apiClient.get<{ success: boolean; data: { topic: Topic; words: Vocabulary[] } }>(
      `/vocabulary/topic/${topicId}`
    );
    return res.data.data;
  },

  async toggleFavorite(wordId: number): Promise<{ wordId: number; is_favorite: number }> {
    const res = await apiClient.post<{ success: boolean; data: { wordId: number; is_favorite: number } }>(
      `/vocabulary/${wordId}/favorite`
    );
    return res.data.data;
  },

  async markLearned(wordId: number, isLearned: boolean): Promise<{ wordId: number; is_learned: number }> {
    const res = await apiClient.post<{ success: boolean; data: { wordId: number; is_learned: number } }>(
      `/vocabulary/${wordId}/progress`,
      { is_learned: isLearned }
    );
    return res.data.data;
  },

  async getFavorites(): Promise<Vocabulary[]> {
    const res = await apiClient.get<{ success: boolean; data: Vocabulary[] }>('/vocabulary/favorites');
    return res.data.data;
  }
};

