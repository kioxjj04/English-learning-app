import { apiClient } from './api';
import { User, UserStatistics } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: User }>('/users/profile');
    return res.data.data;
  },

  async updateProfile(data: { full_name?: string; daily_goal_minutes?: number; avatar_url?: string }): Promise<User> {
    const res = await apiClient.put<{ success: boolean; data: User }>('/users/profile', data);
    return res.data.data;
  },

  async getStatistics(): Promise<UserStatistics> {
    const res = await apiClient.get<{ success: boolean; data: UserStatistics }>('/users/statistics');
    return res.data.data;
  }
};

