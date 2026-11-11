import { apiClient } from './api';
import { AICorrectionResponse } from '../types';

export const aiService = {
  async correctWriting(text: string): Promise<AICorrectionResponse> {
    const res = await apiClient.post<{ success: boolean; data: AICorrectionResponse }>('/ai/correct-writing', {
      text
    });
    return res.data.data;
  }
};

