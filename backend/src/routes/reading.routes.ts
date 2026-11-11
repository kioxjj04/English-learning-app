import { Router } from 'express';
import { readingController } from '../controllers/reading.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

export const readingRouter = Router();

readingRouter.get('/passages', authenticateJWT as any, readingController.getPassages as any);
readingRouter.get('/passage/:id', authenticateJWT as any, readingController.getPassageDetail as any);

