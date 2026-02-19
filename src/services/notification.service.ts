import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { Notification } from '../types';
import { AppError } from '../middleware/errorHandler';

export class NotificationService {
    /**
     * Create a notification for a user.
     */
    static async createNotification(data: {
        userId: string;
        conversationId: string;
        type: string;
        message: string;
    }): Promise<Notification> {
        const supabase = getSupabase();

        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: data.userId,
                conversation_id: data.conversationId,
                type: data.type,
                message: data.message,
            })
            .select('*')
            .single();

        if (error || !notification) {
            logger.error('Failed to create notification', error);
            // Don't throw — notifications shouldn't break the main flow
            return {} as Notification;
        }

        logger.info('Notification created', { userId: data.userId, type: data.type });
        return notification;
    }

    /**
     * Get all notifications for a user.
     */
    static async getUserNotifications(
        userId: string,
        unreadOnly: boolean = false,
    ): Promise<Notification[]> {
        const supabase = getSupabase();

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to fetch notifications', error);
            throw new AppError('Failed to fetch notifications.', 500);
        }

        return data || [];
    }

    /**
     * Mark a notification as read.
     */
    static async markAsRead(notificationId: string, userId: string): Promise<void> {
        const supabase = getSupabase();

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) {
            logger.error('Failed to mark notification as read', error);
            throw new AppError('Failed to update notification.', 500);
        }
    }

    /**
     * Mark all notifications as read for a user.
     */
    static async markAllAsRead(userId: string): Promise<void> {
        const supabase = getSupabase();

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            logger.error('Failed to mark all notifications as read', error);
            throw new AppError('Failed to update notifications.', 500);
        }
    }
}
