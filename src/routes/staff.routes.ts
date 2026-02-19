import { Router } from 'express';
import { body } from 'express-validator';
import { StaffController } from '../controllers/staff.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All staff routes require admin role
router.use(authenticate, authorize('admin'));

/**
 * POST /api/staff — Create a staff member.
 */
router.post(
    '/',
    validate([
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('Valid email is required.'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    ]),
    StaffController.create,
);

/**
 * GET /api/staff — List all staff.
 */
router.get('/', StaffController.getAll);

/**
 * GET /api/staff/:id — Get a staff member.
 */
router.get('/:id', StaffController.getById);

/**
 * DELETE /api/staff/:id — Delete a staff member.
 */
router.delete('/:id', StaffController.delete);

/**
 * GET /api/staff/:id/activity — Get staff activity report.
 */
router.get('/:id/activity', StaffController.getActivity);

export default router;
