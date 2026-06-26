import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config';





export const securityMiddleware = helmet({
  contentSecurityPolicy: false, 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});





export const corsMiddleware = cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
