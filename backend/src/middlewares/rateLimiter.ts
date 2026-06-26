import rateLimit from 'express-rate-limit';
import { config } from '../config';





export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});
