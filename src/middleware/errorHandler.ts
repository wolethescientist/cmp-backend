import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Global error handler middleware.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;

    res.status(statusCode).json({
        success: false,
        error: statusCode === 500 ? 'Internal server error' : err.message,
    });
}

/**
 * Custom application error with status code.
 */
export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
