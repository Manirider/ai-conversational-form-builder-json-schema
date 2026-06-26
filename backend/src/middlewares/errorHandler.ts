import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';




export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}






export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? (err as AppError).statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';


  logger.error('Unhandled error', {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    statusCode,
  });


  const response: ErrorResponse = {
    error: isAppError || !isProduction
      ? err.message
      : 'Internal server error',
  };


  if (!isProduction && !isAppError) {
    response.details = err.stack;
  }

  res.status(statusCode).json(response);
}




export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
