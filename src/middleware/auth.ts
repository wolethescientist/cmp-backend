import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload, UserRole } from '../types';
import { logger } from '../config/logger';

/**
 * Middleware: Verify JWT token and attach user to request.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Authentication required. Provide a Bearer token.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch (err) {
        logger.warn('Invalid or expired JWT token', { error: (err as Error).message });
        res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
}

/**
 * Middleware factory: Restrict access to specific roles.
 */
export function authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required.' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            logger.warn('Access denied', { userId: req.user.userId, role: req.user.role, required: roles });
            res.status(403).json({ success: false, error: 'Insufficient permissions.' });
            return;
        }

        next();
    };
}
