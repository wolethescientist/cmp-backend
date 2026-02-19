import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { Message, Platform, SenderType } from '../types';
import { AppError } from '../middleware/errorHandler';
import { WhatsappService } from './whatsapp.service';
import { InstagramService } from './instagram.service';

export class MessageService {
    /**
     * Store a message in the database.
     */
    static async storeMessage(data: {
        conversationId: string;
        senderType: SenderType;
        content: string;
        platform: Platform;
    }): Promise<Message> {
        const supabase = getSupabase();

        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: data.conversationId,
                sender_type: data.senderType,
                content: data.content,
                platform: data.platform,
            })
            .select('*')
            .single();

        if (error || !message) {
            logger.error('Failed to store message', error);
            throw new AppError('Failed to store message.', 500);
        }

        // Touch conversation updated_at
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', data.conversationId);

        return message;
    }

    /**
     * Get all messages for a conversation (with access check).
     */
    static async getMessages(
        conversationId: string,
        role: 'admin' | 'staff',
        userId: string,
        page: number = 1,
        limit: number = 50,
    ): Promise<{ messages: Message[]; total: number }> {
        const supabase = getSupabase();

        // Access check
        let convQuery = supabase
            .from('conversations')
            .select('id')
            .eq('id', conversationId);

        if (role === 'staff') {
            convQuery = convQuery.eq('assigned_to', userId);
        }

        const { data: conv, error: convErr } = await convQuery.single();
        if (convErr || !conv) {
            throw new AppError('Conversation not found or access denied.', 404);
        }

        const offset = (page - 1) * limit;

        const { data: messages, count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error('Failed to fetch messages', error);
            throw new AppError('Failed to fetch messages.', 500);
        }

        return { messages: messages || [], total: count || 0 };
    }

    /**
     * Reply to a conversation — store in DB and send via platform API.
     */
    static async replyToConversation(
        conversationId: string,
        content: string,
        role: 'admin' | 'staff',
        userId: string,
    ): Promise<Message> {
        const supabase = getSupabase();

        // Fetch conversation with customer info
        let convQuery = supabase
            .from('conversations')
            .select('*, customers(platform_user_id, phone_number, platform)')
            .eq('id', conversationId);

        if (role === 'staff') {
            convQuery = convQuery.eq('assigned_to', userId);
        }

        const { data: conversation, error: convErr } = await convQuery.single();
        if (convErr || !conversation) {
            throw new AppError('Conversation not found or access denied.', 404);
        }

        if (conversation.status === 'resolved') {
            throw new AppError('Cannot reply to a resolved conversation. Reopen it first.', 400);
        }

        const platform = conversation.platform as Platform;
        const customer = conversation.customers;

        // Send via platform API
        try {
            if (platform === 'whatsapp') {
                await WhatsappService.sendMessage(customer.phone_number || customer.platform_user_id, content);
            } else if (platform === 'instagram') {
                await InstagramService.sendMessage(customer.platform_user_id, content);
            }
        } catch (err) {
            logger.error('Failed to send message via platform API', { platform, error: (err as Error).message });
            throw new AppError(`Failed to send message via ${platform}.`, 502);
        }

        // Store the sent message
        const message = await MessageService.storeMessage({
            conversationId,
            senderType: 'staff',
            content,
            platform,
        });

        // Reopen conversation if it was resolved
        await supabase
            .from('conversations')
            .update({ status: 'open', updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        logger.info('Reply sent', { conversationId, platform, userId });
        return message;
    }
}
