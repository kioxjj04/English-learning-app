import { Request, Response } from 'express';
import { dbAsync } from '../database/db.js';

export const listeningController = {
  async getExercises(req: Request, res: Response): Promise<void> {
    try {
      const exercises = await dbAsync.all<any>(
        'SELECT id, title, level, audio_url, duration_seconds FROM listening_exercises ORDER BY id ASC'
      );
      res.json({ success: true, data: exercises });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getExerciseDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const exercise = await dbAsync.get<any>(
        'SELECT * FROM listening_exercises WHERE id = ?',
        [id]
      );

      if (!exercise) {
        res.status(404).json({ success: false, message: 'Listening exercise not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          ...exercise,
          questions: JSON.parse(exercise.questions_json)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

