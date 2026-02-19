import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * POST /api/auth/login
 */
router.post(
    '/login',
    validate([
        body('email').isEmail().withMessage('Valid email is required.'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    ]),
    AuthController.login,
);

/**
 * POST /api/auth/register
 * Public for initial admin setup. In production, protect or disable.
 */
router.post(
    '/register',
    validate([
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('Valid email is required.'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
        body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be admin or staff.'),
    ]),
    AuthController.register,
);

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, AuthController.me);

export default router;
