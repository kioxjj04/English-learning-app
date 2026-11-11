import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { Colors } from '../constants/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 3 // 3 minutes cache
    }
  }
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background }
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="vocabulary/[topicId]"
              options={{
                headerShown: true,
                title: 'Flashcards',
                headerBackTitle: 'Back',
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface }
              }}
            />
            <Stack.Screen
              name="grammar/[lessonId]"
              options={{
                headerShown: true,
                title: 'Grammar Lesson',
                headerBackTitle: 'Back',
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface }
              }}
            />
            <Stack.Screen
              name="listening/[id]"
              options={{
                headerShown: true,
                title: 'Listening Practice',
                headerBackTitle: 'Back',
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface }
              }}
            />
            <Stack.Screen
              name="reading/[id]"
              options={{
                headerShown: true,
                title: 'Reading Comprehension',
                headerBackTitle: 'Back',
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface }
              }}
            />
            <Stack.Screen
              name="quiz/index"
              options={{
                headerShown: true,
                title: 'Challenge & Quizzes',
                headerBackTitle: 'Learn',
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface }
              }}
            />
            <Stack.Screen
              name="quiz/[id]"
              options={{
                headerShown: true,
                title: 'Quiz In Progress',
                headerBackVisible: false,
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface }
              }}
            />
            <Stack.Screen
              name="quiz/result"
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen
              name="ai-assistant/index"
              options={{
                headerShown: true,
                title: 'AI Writing Assistant',
                headerBackTitle: 'Back',
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface }
              }}
            />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

