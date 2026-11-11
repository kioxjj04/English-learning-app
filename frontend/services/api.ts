import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

export const apiClient = axios.create({
  baseURL: Config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Check if custom server IP is saved in storage
      const customApiUrl = await AsyncStorage.getItem('@englishgo_api_url');
      if (customApiUrl && config.baseURL !== customApiUrl) {
        config.baseURL = customApiUrl;
      }

      const token = await AsyncStorage.getItem('@englishgo_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error attaching token to request:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out' : 'Network error or server unreachable');
    return Promise.reject(new Error(message));
  }
);

