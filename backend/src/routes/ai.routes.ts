import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

export const aiRouter = Router();

aiRouter.post('/correct-writing', authenticateJWT as any, aiController.correctWriting as any);

