'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { User } from '@/lib/types';
import { getStaff, register } from '@/lib/api';
import styles from './StaffPage.module.css';

export default function StaffPage() {
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'staff' as 'admin' | 'staff' });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const data = await getStaff();
            setStaff(data);
        } catch (err) {
            console.error('Failed to load staff', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(newUser.name, newUser.email, newUser.password, newUser.role);
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'staff' });
            loadStaff();
        } catch (err) {
            console.error('Failed to create staff', err);
            alert('Failed to create staff member');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading staff...</div>;

    return (
        <div className="p-8 w-full h-full overflow-y-auto">
            <div className={styles.header}>
                <h1 className={styles.title}>Team Members</h1>
                <button className={styles.addButton} onClick={() => setShowModal(true)}>
                    <UserPlus size={20} />
                    Add Member
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}>Email</th>
                            <th className={styles.th}>Role</th>
                            <th className={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((user) => (
                            <tr key={user.id} className={styles.tr}>
                                <td className={styles.td}>{user.name}</td>
                                <td className={styles.td}>{user.email}</td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${user.role === 'admin' ? styles.admin : styles.staff}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    <button className="text-red-400 hover:text-red-300" title="Delete (Not implemented)">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>Add Team Member</h2>
                        <form onSubmit={handleAddStaff}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input
                                    className={styles.input}
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Role</label>
                                <select
                                    className={styles.input}
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'staff' })}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitButton}>Create Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
