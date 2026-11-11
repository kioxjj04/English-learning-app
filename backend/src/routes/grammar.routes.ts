import { Router } from 'express';
import { grammarController } from '../controllers/grammar.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

export const grammarRouter = Router();

grammarRouter.get('/lessons', authenticateJWT as any, grammarController.getLessons as any);
grammarRouter.get('/lesson/:lessonId', authenticateJWT as any, grammarController.getLessonDetail as any);
grammarRouter.post('/lesson/:lessonId/submit', authenticateJWT as any, grammarController.submitLesson as any);

