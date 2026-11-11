import { Response } from 'express';
import { dbAsync } from '../database/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const vocabularyController = {
  async getTopics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const topics = await dbAsync.all<any>(
        `SELECT t.*, 
          COUNT(v.id) as total_words,
          COUNT(CASE WHEN uvp.is_learned = 1 THEN 1 END) as learned_words
         FROM topics t
         LEFT JOIN vocabularies v ON v.topic_id = t.id
         LEFT JOIN user_vocabulary_progress uvp ON uvp.vocabulary_id = v.id AND uvp.user_id = ?
         WHERE t.category = 'vocabulary'
         GROUP BY t.id
         ORDER BY t.order_index ASC`,
        [userId || 0]
      );

      res.json({ success: true, data: topics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getWordsByTopic(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { topicId } = req.params;
      const userId = req.user?.id;

      const words = await dbAsync.all<any>(
        `SELECT v.*, 
          COALESCE(uvp.is_learned, 0) as is_learned,
          COALESCE(uvp.is_favorite, 0) as is_favorite,
          COALESCE(uvp.review_count, 0) as review_count
         FROM vocabularies v
         LEFT JOIN user_vocabulary_progress uvp ON uvp.vocabulary_id = v.id AND uvp.user_id = ?
         WHERE v.topic_id = ?
         ORDER BY v.id ASC`,
        [userId || 0, topicId]
      );

      const topic = await dbAsync.get('SELECT * FROM topics WHERE id = ?', [topicId]);

      res.json({ success: true, data: { topic, words } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async toggleFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { wordId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const existing = await dbAsync.get<any>(
        'SELECT * FROM user_vocabulary_progress WHERE user_id = ? AND vocabulary_id = ?',
        [userId, wordId]
      );

      let newFavoriteStatus = 1;
      if (existing) {
        newFavoriteStatus = existing.is_favorite === 1 ? 0 : 1;
        await dbAsync.run(
          'UPDATE user_vocabulary_progress SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newFavoriteStatus, existing.id]
        );
      } else {
        await dbAsync.run(
          `INSERT INTO user_vocabulary_progress (user_id, vocabulary_id, is_favorite, is_learned, review_count)
           VALUES (?, ?, 1, 0, 0)`,
          [userId, wordId]
        );
      }

      res.json({
        success: true,
        message: newFavoriteStatus === 1 ? 'Added to favorites' : 'Removed from favorites',
        data: { wordId: Number(wordId), is_favorite: newFavoriteStatus }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async markLearned(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { wordId } = req.params;
      const userId = req.user?.id;
      const { is_learned } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const learnedVal = is_learned !== undefined ? (is_learned ? 1 : 0) : 1;

      const existing = await dbAsync.get<any>(
        'SELECT * FROM user_vocabulary_progress WHERE user_id = ? AND vocabulary_id = ?',
        [userId, wordId]
      );

      if (existing) {
        await dbAsync.run(
          `UPDATE user_vocabulary_progress 
           SET is_learned = ?, review_count = review_count + 1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [learnedVal, existing.id]
        );
      } else {
        await dbAsync.run(
          `INSERT INTO user_vocabulary_progress (user_id, vocabulary_id, is_learned, is_favorite, review_count)
           VALUES (?, ?, ?, 0, 1)`,
          [userId, wordId, learnedVal]
        );
      }

      // Update daily stats for user
      const today = new Date().toISOString().split('T')[0];
      const existingStat = await dbAsync.get<any>(
        'SELECT * FROM user_daily_stats WHERE user_id = ? AND date = ?',
        [userId, today]
      );

      if (existingStat) {
        await dbAsync.run(
          'UPDATE user_daily_stats SET words_learned = words_learned + 1, study_time_minutes = study_time_minutes + 2 WHERE id = ?',
          [existingStat.id]
        );
      } else {
        await dbAsync.run(
          'INSERT INTO user_daily_stats (user_id, date, words_learned, lessons_completed, quiz_score_avg, study_time_minutes) VALUES (?, ?, 1, 0, 0, 5)',
          [userId, today]
        );
      }

      res.json({
        success: true,
        message: 'Vocabulary progress updated',
        data: { wordId: Number(wordId), is_learned: learnedVal }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getFavorites(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const favorites = await dbAsync.all<any>(
        `SELECT v.*, 1 as is_favorite, uvp.is_learned
         FROM vocabularies v
         INNER JOIN user_vocabulary_progress uvp ON uvp.vocabulary_id = v.id
         WHERE uvp.user_id = ? AND uvp.is_favorite = 1
         ORDER BY uvp.updated_at DESC`,
        [userId || 0]
      );

      res.json({ success: true, data: favorites });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

