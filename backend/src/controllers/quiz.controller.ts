import { Response } from 'express';
import { dbAsync } from '../database/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const quizController = {
  async getQuizzes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const quizzes = await dbAsync.all<any>(
        `SELECT q.id, q.title, q.type, q.time_limit_seconds,
          (SELECT COUNT(*) FROM json_each(q.questions_json)) as total_questions,
          (SELECT MAX(qr.score) FROM quiz_results qr WHERE qr.quiz_id = q.id AND qr.user_id = ?) as highest_score
         FROM quizzes q
         ORDER BY q.id ASC`,
        [userId || 0]
      );

      res.json({ success: true, data: quizzes });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getQuizDetail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const quiz = await dbAsync.get<any>('SELECT * FROM quizzes WHERE id = ?', [id]);

      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          ...quiz,
          questions: JSON.parse(quiz.questions_json)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async submitQuiz(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { userAnswers, timeSpentSeconds } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const quiz = await dbAsync.get<any>('SELECT * FROM quizzes WHERE id = ?', [id]);
      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found' });
        return;
      }

      const questions = JSON.parse(quiz.questions_json);
      let correctCount = 0;
      const reviewDetails: any[] = [];

      for (const q of questions) {
        const selected = userAnswers?.[q.id];
        const isCorrect = selected === q.correct_answer;
        if (isCorrect) correctCount++;

        reviewDetails.push({
          id: q.id,
          question: q.question,
          selected,
          correct_answer: q.correct_answer,
          isCorrect,
          explanation: q.explanation
        });
      }

      const totalQuestions = questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      // Save result
      const insertResult = await dbAsync.run(
        `INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, time_spent_seconds)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, id, score, totalQuestions, timeSpentSeconds || 0]
      );

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const existingStat = await dbAsync.get<any>(
        'SELECT * FROM user_daily_stats WHERE user_id = ? AND date = ?',
        [userId, today]
      );

      if (existingStat) {
        const newAvg = Math.round((existingStat.quiz_score_avg + score) / 2);
        await dbAsync.run(
          `UPDATE user_daily_stats 
           SET lessons_completed = lessons_completed + 1, quiz_score_avg = ?, study_time_minutes = study_time_minutes + ? 
           WHERE id = ?`,
          [newAvg, Math.max(1, Math.round((timeSpentSeconds || 60) / 60)), existingStat.id]
        );
      } else {
        await dbAsync.run(
          `INSERT INTO user_daily_stats (user_id, date, words_learned, lessons_completed, quiz_score_avg, study_time_minutes)
           VALUES (?, ?, 0, 1, ?, ?)`,
          [userId, today, score, Math.max(1, Math.round((timeSpentSeconds || 60) / 60))]
        );
      }

      res.json({
        success: true,
        message: 'Quiz submitted successfully',
        data: {
          resultId: insertResult.lastID,
          score,
          correctCount,
          totalQuestions,
          timeSpentSeconds,
          reviewDetails
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

