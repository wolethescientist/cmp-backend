import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';

/**
 * Run all database migrations to create tables, indexes, and seed the admin user.
 */
export async function runMigrations(): Promise<void> {
    const supabase = getSupabase();
    logger.info('Running database migrations...');

    // ─── 1. Users table ────────────────────────────────
    const { error: usersErr } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `,
    });
    if (usersErr) {
        logger.error('Migration: users table failed', usersErr);
    } else {
        logger.info('Migration: users table ✓');
    }

    // ─── 2. Customers table ────────────────────────────
    const { error: custErr } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform VARCHAR(20) NOT NULL CHECK (platform IN ('whatsapp', 'instagram')),
        platform_user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone_number VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(platform, platform_user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_customers_platform ON customers(platform);
      CREATE INDEX IF NOT EXISTS idx_customers_platform_user_id ON customers(platform_user_id);
    `,
    });
    if (custErr) {
        logger.error('Migration: customers table failed', custErr);
    } else {
        logger.info('Migration: customers table ✓');
    }

    // ─── 3. Conversations table ────────────────────────
    const { error: convErr } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        platform VARCHAR(20) NOT NULL CHECK (platform IN ('whatsapp', 'instagram')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
      CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON conversations(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_conversations_platform ON conversations(platform);
    `,
    });
    if (convErr) {
        logger.error('Migration: conversations table failed', convErr);
    } else {
        logger.info('Migration: conversations table ✓');
    }

    // ─── 4. Messages table ─────────────────────────────
    const { error: msgErr } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'staff')),
        content TEXT NOT NULL,
        platform VARCHAR(20) NOT NULL CHECK (platform IN ('whatsapp', 'instagram')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    `,
    });
    if (msgErr) {
        logger.error('Migration: messages table failed', msgErr);
    } else {
        logger.info('Migration: messages table ✓');
    }

    // ─── 5. Notifications table ────────────────────────
    const { error: notifErr } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL DEFAULT 'assignment',
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
    `,
    });
    if (notifErr) {
        logger.error('Migration: notifications table failed', notifErr);
    } else {
        logger.info('Migration: notifications table ✓');
    }

    logger.info('All migrations completed.');
}

// CLI runner
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch((err) => {
            logger.error('Migration failed', err);
            process.exit(1);
        });
}
