'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="flex-center" style={{ height: '100vh', background: 'var(--background)' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading Central...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.content}>{children}</main>
        </div>
    );
}
