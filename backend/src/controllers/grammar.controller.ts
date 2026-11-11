import { Response } from 'express';
import { dbAsync } from '../database/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const grammarController = {
  async getLessons(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const lessons = await dbAsync.all<any>(
        `SELECT gl.*, 
          COALESCE(ugp.is_completed, 0) as is_completed,
          COALESCE(ugp.score, 0) as user_score,
          (SELECT COUNT(*) FROM grammar_questions gq WHERE gq.lesson_id = gl.id) as total_questions
         FROM grammar_lessons gl
         LEFT JOIN user_grammar_progress ugp ON ugp.lesson_id = gl.id AND ugp.user_id = ?
         ORDER BY gl.order_index ASC`,
        [userId || 0]
      );

      res.json({ success: true, data: lessons });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getLessonDetail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const lesson = await dbAsync.get<any>(
        'SELECT * FROM grammar_lessons WHERE id = ?',
        [lessonId]
      );

      if (!lesson) {
        res.status(404).json({ success: false, message: 'Grammar lesson not found' });
        return;
      }

      const rawQuestions = await dbAsync.all<any>(
        'SELECT * FROM grammar_questions WHERE lesson_id = ? ORDER BY id ASC',
        [lessonId]
      );

      const questions = rawQuestions.map((q) => ({
        ...q,
        options: JSON.parse(q.options_json)
      }));

      res.json({
        success: true,
        data: {
          ...lesson,
          questions
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async submitLesson(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.id;
      const { score } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const existing = await dbAsync.get<any>(
        'SELECT * FROM user_grammar_progress WHERE user_id = ? AND lesson_id = ?',
        [userId, lessonId]
      );

      if (existing) {
        await dbAsync.run(
          'UPDATE user_grammar_progress SET score = MAX(score, ?), is_completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
          [score, existing.id]
        );
      } else {
        await dbAsync.run(
          'INSERT INTO user_grammar_progress (user_id, lesson_id, score, is_completed) VALUES (?, ?, ?, 1)',
          [userId, lessonId, score]
        );
      }

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const existingStat = await dbAsync.get<any>(
        'SELECT * FROM user_daily_stats WHERE user_id = ? AND date = ?',
        [userId, today]
      );

      if (existingStat) {
        await dbAsync.run(
          'UPDATE user_daily_stats SET lessons_completed = lessons_completed + 1, study_time_minutes = study_time_minutes + 10 WHERE id = ?',
          [existingStat.id]
        );
      } else {
        await dbAsync.run(
          'INSERT INTO user_daily_stats (user_id, date, words_learned, lessons_completed, quiz_score_avg, study_time_minutes) VALUES (?, ?, 0, 1, 0, 10)',
          [userId, today]
        );
      }

      res.json({
        success: true,
        message: 'Grammar practice submitted successfully',
        data: { lessonId: Number(lessonId), score }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

