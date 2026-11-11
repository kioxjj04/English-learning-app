import { apiClient } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', {
      email,
      password,
      full_name
    });
    return res.data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', {
      email,
      password
    });
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  }
};

