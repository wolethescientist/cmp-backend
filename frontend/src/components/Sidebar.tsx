'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, Settings, LogOut, Instagram, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '@/lib/types';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const navItems = [
        { id: '/dashboard/whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: '/dashboard/instagram', label: 'Instagram', icon: Instagram },
        { id: '/dashboard/staff', label: 'Team', icon: Users, role: 'admin' },
        { id: '/dashboard/stats', label: 'Analytics', icon: LayoutDashboard }, // Added Analytics placeholder
        { id: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.logoContainer}>
                    <div className={styles.logoIcon} />
                    <h1 className={styles.logo}>Central</h1>
                </div>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    if (item.role && user?.role !== item.role) return null;
                    const isActive = pathname.startsWith(item.id);

                    return (
                        <div
                            key={item.id}
                            className={`${styles.item} ${isActive ? styles.active : ''}`}
                            onClick={() => router.push(item.id)}
                        >
                            <div className={styles.iconWrapper}>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={styles.label}>{item.label}</span>
                            {isActive && <motion.div layoutId="activeNav" className={styles.activeIndicator} />}
                        </div>
                    );
                })}
            </nav>

            <div className={styles.user}>
                <div className={styles.avatar}>
                    <UserIcon size={20} />
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{user?.name}</div>
                    <div className={styles.userRole}>{user?.role}</div>
                </div>
                <button onClick={handleLogout} className={styles.logout} title="Sign Out">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
