import { Router } from 'express';
import { vocabularyController } from '../controllers/vocabulary.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

export const vocabularyRouter = Router();

// Allow reading topics with or without auth, but with auth we get user progress
vocabularyRouter.get('/topics', authenticateJWT as any, vocabularyController.getTopics as any);
vocabularyRouter.get('/topic/:topicId', authenticateJWT as any, vocabularyController.getWordsByTopic as any);
vocabularyRouter.post('/:wordId/favorite', authenticateJWT as any, vocabularyController.toggleFavorite as any);
vocabularyRouter.post('/:wordId/progress', authenticateJWT as any, vocabularyController.markLearned as any);
vocabularyRouter.get('/favorites', authenticateJWT as any, vocabularyController.getFavorites as any);

