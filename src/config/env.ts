import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function optionalEnv(key: string, fallback: string): string {
    return process.env[key] || fallback;
}

export const env = {
    // Server
    PORT: parseInt(optionalEnv('PORT', '3000'), 10),
    NODE_ENV: optionalEnv('NODE_ENV', 'development'),

    // JWT
    JWT_SECRET: requireEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),

    // Supabase
    SUPABASE_URL: requireEnv('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE: requireEnv('SUPABASE_SERVICE_ROLE'),

    // Instagram
    INSTAGRAM_ACCESS_TOKEN: requireEnv('INSTAGRAM_ACCESS_TOKEN'),
    INSTAGRAM_APP_ID: requireEnv('INSTAGRAM_APP_ID'),
    INSTAGRAM_APP_SECRET: requireEnv('INSTAGRAM_APP_SECRET'),
    INSTAGRAM_BUSINESS_ID: requireEnv('INSTAGRAM_BUSINESS_ID'),
    INSTAGRAM_WEBHOOK_VERIFY_TOKEN: optionalEnv('INSTAGRAM_WEBHOOK_VERIFY_TOKEN', ''),
    INSTAGRAM_BASE_URL: requireEnv('INSTAGRAM_BASE_URL'),

    // WhatsApp
    WHATSAPP_ACCESS_TOKEN: requireEnv('WHATSAPP_ACCESS_TOKEN'),
    WHATSAPP_PHONE_NUMBER_ID: requireEnv('WHATSAPP_PHONE_NUMBER_ID'),
    WHATSAPP_BUSINESS_ACCOUNT_ID: requireEnv('WHATSAPP_BUSINESS_ACCOUNT_ID'),
    WHATSAPP_VERIFY_TOKEN: optionalEnv('WHATSAPP_VERIFY_TOKEN', ''),
    WHATSAPP_BASE_URL: requireEnv('WHATSAPP_BASE_URL'),

    // Meta
    META_APP_ID: requireEnv('META_APP_ID'),
    META_APP_SECRET: requireEnv('META_APP_SECRET'),
} as const;
