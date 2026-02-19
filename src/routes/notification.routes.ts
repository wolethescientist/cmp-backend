import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * GET /api/notifications — Get notifications (query: ?unread=true).
 */
router.get('/', NotificationController.getAll);

/**
 * PATCH /api/notifications/read-all — Mark all as read.
 */
router.patch('/read-all', NotificationController.markAllAsRead);

/**
 * PATCH /api/notifications/:id/read — Mark a notification as read.
 */
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
