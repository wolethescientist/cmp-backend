import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
    /**
     * GET /api/notifications — Get notifications for the current user.
     */
    static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user!;
            const unreadOnly = req.query.unread === 'true';

            const notifications = await NotificationService.getUserNotifications(user.userId, unreadOnly);

            res.status(200).json({ success: true, data: notifications });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/notifications/:id/read — Mark a notification as read.
     */
    static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user!;
            await NotificationService.markAsRead(req.params.id as string, user.userId);

            res.status(200).json({ success: true, message: 'Notification marked as read.' });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/notifications/read-all — Mark all notifications as read.
     */
    static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user!;
            await NotificationService.markAllAsRead(user.userId);

            res.status(200).json({ success: true, message: 'All notifications marked as read.' });
        } catch (err) {
            next(err);
        }
    }
}
