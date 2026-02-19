'use client';

import styles from './SettingsPage.module.css';

export default function SettingsPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Settings</h1>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Profile</h2>
                <p className={styles.description}>Update your personal information</p>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input type="text" className={styles.input} placeholder="Your Name" />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" className={styles.input} placeholder="you@company.com" disabled />
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <p className={styles.description}>Customize your workspace theme</p>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Theme</label>
                    <select className={styles.input}>
                        <option>Dark Mode (Default)</option>
                        <option disabled>Light Mode (Coming Soon)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
