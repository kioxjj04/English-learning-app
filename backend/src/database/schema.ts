import { dbAsync } from './db.js';

export async function initializeDatabase(): Promise<void> {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      daily_goal_minutes INTEGER DEFAULT 15,
      streak_count INTEGER DEFAULT 1,
      last_active_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      category TEXT NOT NULL, -- 'vocabulary', 'grammar', 'listening', 'reading'
      level TEXT NOT NULL,    -- 'Beginner', 'Intermediate', 'Advanced'
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS vocabularies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER,
      word TEXT NOT NULL,
      phonetic TEXT,
      part_of_speech TEXT,
      meaning_vi TEXT NOT NULL,
      example_en TEXT NOT NULL,
      example_vi TEXT NOT NULL,
      audio_url TEXT,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vocabulary_id INTEGER NOT NULL,
      is_learned INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, vocabulary_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS grammar_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      summary TEXT,
      content_markdown TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS grammar_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES grammar_lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_grammar_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES grammar_lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS listening_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 60,
      transcript TEXT NOT NULL,
      questions_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reading_passages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      passage_text TEXT NOT NULL,
      questions_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'standard', -- 'daily_challenge', 'standard'
      time_limit_seconds INTEGER DEFAULT 300,
      questions_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      time_spent_seconds INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      words_learned INTEGER DEFAULT 0,
      lessons_completed INTEGER DEFAULT 0,
      quiz_score_avg REAL DEFAULT 0,
      study_time_minutes INTEGER DEFAULT 0,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  await dbAsync.exec(schemaSql);
  console.log('✅ SQLite Schema initialized successfully.');
}

