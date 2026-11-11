import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

export const userRouter = Router();

userRouter.get('/profile', authenticateJWT as any, userController.getProfile as any);
userRouter.put('/profile', authenticateJWT as any, userController.updateProfile as any);
userRouter.get('/statistics', authenticateJWT as any, userController.getStatistics as any);

