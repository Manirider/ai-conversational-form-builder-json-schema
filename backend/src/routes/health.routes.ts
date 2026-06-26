import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();





router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    provider: config.AI_PROVIDER,
  });
});

export default router;
