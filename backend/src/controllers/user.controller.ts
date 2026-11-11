import { Response } from 'express';
import { dbAsync } from '../database/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const userController = {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const user = await dbAsync.get<any>(
        'SELECT id, email, full_name, avatar_url, daily_goal_minutes, streak_count, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { full_name, daily_goal_minutes, avatar_url } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await dbAsync.run(
        `UPDATE users 
         SET full_name = COALESCE(?, full_name),
             daily_goal_minutes = COALESCE(?, daily_goal_minutes),
             avatar_url = COALESCE(?, avatar_url)
         WHERE id = ?`,
        [full_name, daily_goal_minutes, avatar_url, userId]
      );

      const updated = await dbAsync.get<any>(
        'SELECT id, email, full_name, avatar_url, daily_goal_minutes, streak_count FROM users WHERE id = ?',
        [userId]
      );

      res.json({ success: true, message: 'Profile updated successfully', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      // 1. Total learned words
      const vocabCount = await dbAsync.get<any>(
        'SELECT COUNT(*) as count FROM user_vocabulary_progress WHERE user_id = ? AND is_learned = 1',
        [userId || 0]
      );

      // 2. Completed grammar lessons
      const grammarCount = await dbAsync.get<any>(
        'SELECT COUNT(*) as count FROM user_grammar_progress WHERE user_id = ? AND is_completed = 1',
        [userId || 0]
      );

      // 3. Quiz accuracy
      const quizStats = await dbAsync.get<any>(
        'SELECT COUNT(*) as count, AVG(score) as avg_score FROM quiz_results WHERE user_id = ?',
        [userId || 0]
      );

      // 4. User profile for streak
      const user = await dbAsync.get<any>('SELECT streak_count, daily_goal_minutes FROM users WHERE id = ?', [userId]);

      // 5. Last 7 days stats
      const weeklyStats = await dbAsync.all<any>(
        `SELECT date, words_learned, lessons_completed, quiz_score_avg, study_time_minutes 
         FROM user_daily_stats 
         WHERE user_id = ? 
         ORDER BY date DESC 
         LIMIT 7`,
        [userId || 0]
      );

      // 6. Recent quiz history
      const recentQuizzes = await dbAsync.all<any>(
        `SELECT qr.score, qr.total_questions, qr.time_spent_seconds, qr.completed_at, q.title 
         FROM quiz_results qr
         INNER JOIN quizzes q ON q.id = qr.quiz_id
         WHERE qr.user_id = ?
         ORDER BY qr.completed_at DESC
         LIMIT 5`,
        [userId || 0]
      );

      res.json({
        success: true,
        data: {
          streakCount: user?.streak_count || 1,
          dailyGoalMinutes: user?.daily_goal_minutes || 15,
          totalWordsLearned: vocabCount?.count || 0,
          totalLessonsCompleted: grammarCount?.count || 0,
          totalQuizzesTaken: quizStats?.count || 0,
          averageQuizAccuracy: Math.round(quizStats?.avg_score || 0),
          weeklyStats: weeklyStats.reverse(),
          recentQuizzes
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

