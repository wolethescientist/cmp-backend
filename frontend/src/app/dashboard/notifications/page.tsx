'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageSquare } from 'lucide-react';
import { Notification } from '@/lib/types';
import { getNotifications, markAllRead } from '@/lib/api';
import styles from './NotificationsPage.module.css';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications(false); // get all, not just unread
            setNotifications(data);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead();
            loadNotifications();
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
    };

    if (loading) return <div className="p-8">Loading notifications...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                Notifications
                <span className={styles.markAll} onClick={handleMarkAllRead}>Mark all as read</span>
            </h1>

            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No notifications</div>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif.id} className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}>
                            <div className={styles.icon}>
                                <MessageSquare size={20} />
                            </div>
                            <div className={styles.content}>
                                <p className={styles.message}>{notif.message}</p>
                                <div className={styles.time}>
                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
