import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

export const quizRouter = Router();

quizRouter.get('/all', authenticateJWT as any, quizController.getQuizzes as any);
quizRouter.get('/:id', authenticateJWT as any, quizController.getQuizDetail as any);
quizRouter.post('/:id/submit', authenticateJWT as any, quizController.submitQuiz as any);

