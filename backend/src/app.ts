import express from 'express';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes';
import formRoutes from './routes/form.routes';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { securityMiddleware, corsMiddleware } from './middlewares/security';





const app = express();


app.use(securityMiddleware);
app.use(corsMiddleware);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}


app.use(rateLimiter);


app.use('/', healthRoutes);
app.use('/api/form', formRoutes);


app.use(errorHandler);

export default app;
