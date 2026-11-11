import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token and user on app startup
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await AsyncStorage.getItem('@englishgo_token');
        const storedUser = await AsyncStorage.getItem('@englishgo_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Try silently refreshing user data from backend
          try {
            const freshUser = await authService.getMe();
            setUser(freshUser);
            await AsyncStorage.setItem('@englishgo_user', JSON.stringify(freshUser));
          } catch (e) {
            // Token might have expired or server offline, keep stored user
          }
        }
      } catch (err) {
        console.error('Failed to restore authentication state:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const authData: AuthResponse = await authService.login(email, password);
    setToken(authData.token);
    setUser(authData.user);

    await AsyncStorage.setItem('@englishgo_token', authData.token);
    await AsyncStorage.setItem('@englishgo_user', JSON.stringify(authData.user));
  };

  const register = async (email: string, password: string, fullName: string) => {
    const authData: AuthResponse = await authService.register(email, password, fullName);
    setToken(authData.token);
    setUser(authData.user);

    await AsyncStorage.setItem('@englishgo_token', authData.token);
    await AsyncStorage.setItem('@englishgo_user', JSON.stringify(authData.user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('@englishgo_token');
    await AsyncStorage.removeItem('@englishgo_user');
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      await AsyncStorage.setItem('@englishgo_user', JSON.stringify(freshUser));
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

