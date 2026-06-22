import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps an async route handler so any rejected promise is forwarded to
// Express's error handler instead of becoming an unhandled rejection
// (which crashes the process and returns a 502 with no CORS headers).
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
