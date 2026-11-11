import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { vocabularyRouter } from './vocabulary.routes.js';
import { grammarRouter } from './grammar.routes.js';
import { listeningRouter } from './listening.routes.js';
import { readingRouter } from './reading.routes.js';
import { quizRouter } from './quiz.routes.js';
import { aiRouter } from './ai.routes.js';
import { userRouter } from './user.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/vocabulary', vocabularyRouter);
apiRouter.use('/grammar', grammarRouter);
apiRouter.use('/listening', listeningRouter);
apiRouter.use('/reading', readingRouter);
apiRouter.use('/quiz', quizRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/users', userRouter);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'EnglishGo API'
  });
});

