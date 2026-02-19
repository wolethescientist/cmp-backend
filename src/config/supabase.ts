import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabase: SupabaseClient;

export function getSupabase(): SupabaseClient {
    if (!supabase) {
        supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
    }
    return supabase;
}
