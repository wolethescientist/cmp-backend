import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { Conversation, Platform, ConversationStatus } from '../types';
import { AppError } from '../middleware/errorHandler';
import { NotificationService } from './notification.service';

export class ConversationService {
    /**
     * List conversations with optional filters.
     * Admin sees all; staff sees only assigned.
     */
    static async listConversations(filters: {
        role: 'admin' | 'staff';
        userId: string;
        platform?: Platform;
        status?: ConversationStatus;
        page?: number;
        limit?: number;
    }): Promise<{ conversations: any[]; total: number }> {
        const supabase = getSupabase();
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('conversations')
            .select('*, customers(id, name, platform, platform_user_id, phone_number), users!conversations_assigned_to_fkey(id, name, email)', { count: 'exact' });

        // Role-based scoping
        if (filters.role === 'staff') {
            query = query.eq('assigned_to', filters.userId);
        }

        if (filters.platform) {
            query = query.eq('platform', filters.platform);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        query = query
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            logger.error('Failed to list conversations', error);
            throw new AppError('Failed to fetch conversations.', 500);
        }

        return { conversations: data || [], total: count || 0 };
    }

    /**
     * Get a single conversation with messages.
     */
    static async getConversation(
        conversationId: string,
        role: 'admin' | 'staff',
        userId: string,
    ): Promise<any> {
        const supabase = getSupabase();

        let query = supabase
            .from('conversations')
            .select('*, customers(id, name, platform, platform_user_id, phone_number), users!conversations_assigned_to_fkey(id, name, email)')
            .eq('id', conversationId);

        if (role === 'staff') {
            query = query.eq('assigned_to', userId);
        }

        const { data: conversation, error } = await query.single();

        if (error || !conversation) {
            throw new AppError('Conversation not found or access denied.', 404);
        }

        // Fetch messages for this conversation
        const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        return { ...conversation, messages: messages || [] };
    }

    /**
     * Assign a conversation to a staff member.
     */
    static async assignConversation(conversationId: string, staffId: string): Promise<Conversation> {
        const supabase = getSupabase();

        // Verify staff exists
        const { data: staff, error: staffErr } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', staffId)
            .eq('role', 'staff')
            .single();

        if (staffErr || !staff) {
            throw new AppError('Staff member not found.', 404);
        }

        // Verify conversation exists
        const { data: conv, error: convErr } = await supabase
            .from('conversations')
            .select('*, customers(name, platform)')
            .eq('id', conversationId)
            .single();

        if (convErr || !conv) {
            throw new AppError('Conversation not found.', 404);
        }

        // Update assignment
        const { data: updated, error } = await supabase
            .from('conversations')
            .update({ assigned_to: staffId, updated_at: new Date().toISOString() })
            .eq('id', conversationId)
            .select('*')
            .single();

        if (error || !updated) {
            logger.error('Failed to assign conversation', error);
            throw new AppError('Failed to assign conversation.', 500);
        }

        // Push notification to staff
        await NotificationService.createNotification({
            userId: staffId,
            conversationId,
            type: 'assignment',
            message: `You have been assigned a new ${conv.customers?.platform || 'unknown'} conversation with ${conv.customers?.name || 'Unknown Customer'}.`,
        });

        logger.info('Conversation assigned', { conversationId, staffId });
        return updated;
    }

    /**
     * Update conversation status.
     */
    static async updateStatus(
        conversationId: string,
        status: ConversationStatus,
        role: 'admin' | 'staff',
        userId: string,
    ): Promise<Conversation> {
        const supabase = getSupabase();

        let query = supabase
            .from('conversations')
            .select('id')
            .eq('id', conversationId);

        if (role === 'staff') {
            query = query.eq('assigned_to', userId);
        }

        const { data: exists, error: existErr } = await query.single();
        if (existErr || !exists) {
            throw new AppError('Conversation not found or access denied.', 404);
        }

        const { data: updated, error } = await supabase
            .from('conversations')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', conversationId)
            .select('*')
            .single();

        if (error || !updated) {
            logger.error('Failed to update conversation status', error);
            throw new AppError('Failed to update status.', 500);
        }

        logger.info('Conversation status updated', { conversationId, status });
        return updated;
    }

    /**
     * Find or create a conversation for an incoming message.
     */
    static async findOrCreateConversation(customerId: string, platform: Platform): Promise<Conversation> {
        const supabase = getSupabase();

        // Check for existing open conversation
        const { data: existing } = await supabase
            .from('conversations')
            .select('*')
            .eq('customer_id', customerId)
            .eq('platform', platform)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existing) {
            // Touch updated_at
            await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', existing.id);
            return existing;
        }

        // Create new conversation
        const { data: created, error } = await supabase
            .from('conversations')
            .insert({ customer_id: customerId, platform, status: 'open' })
            .select('*')
            .single();

        if (error || !created) {
            logger.error('Failed to create conversation', error);
            throw new AppError('Failed to create conversation.', 500);
        }

        logger.info('New conversation created', { conversationId: created.id, platform });
        return created;
    }
}
