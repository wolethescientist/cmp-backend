'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, Settings, LogOut, Crown, User as UserIcon } from 'lucide-react';
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
        { id: '/dashboard', label: 'Messages', icon: MessageSquare },
        { id: '/dashboard/staff', label: 'Staff', icon: Users, role: 'admin' },
        { id: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <h1 className={styles.logo}>Central</h1>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    if (item.role && user?.role !== item.role) return null;
                    const isActive = pathname === item.id;

                    return (
                        <div
                            key={item.id}
                            className={`${styles.item} ${isActive ? styles.active : ''}`}
                            onClick={() => router.push(item.id)}
                        >
                            <item.icon size={20} />
                            {item.label}
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
