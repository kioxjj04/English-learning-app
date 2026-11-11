import { Platform } from 'react-native';

// In development, Android emulator uses 10.0.2.2, iOS simulator uses localhost
const getLocalDevUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || getLocalDevUrl(),
  appName: 'EnglishGo',
  version: '1.0.0'
};

