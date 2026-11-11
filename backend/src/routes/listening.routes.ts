import { Router } from 'express';
import { listeningController } from '../controllers/listening.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

export const listeningRouter = Router();

listeningRouter.get('/exercises', authenticateJWT as any, listeningController.getExercises as any);
listeningRouter.get('/exercise/:id', authenticateJWT as any, listeningController.getExerciseDetail as any);

