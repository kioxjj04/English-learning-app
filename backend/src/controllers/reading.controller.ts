import { Request, Response } from 'express';
import { dbAsync } from '../database/db.js';

export const readingController = {
  async getPassages(req: Request, res: Response): Promise<void> {
    try {
      const passages = await dbAsync.all<any>(
        'SELECT id, title, level, SUBSTR(passage_text, 1, 120) || "..." as preview FROM reading_passages ORDER BY id ASC'
      );
      res.json({ success: true, data: passages });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getPassageDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const passage = await dbAsync.get<any>(
        'SELECT * FROM reading_passages WHERE id = ?',
        [id]
      );

      if (!passage) {
        res.status(404).json({ success: false, message: 'Reading passage not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          ...passage,
          questions: JSON.parse(passage.questions_json)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

