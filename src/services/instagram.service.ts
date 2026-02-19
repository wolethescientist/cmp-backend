import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class InstagramService {
    /**
     * Send a text message via Instagram Graph API.
     */
    static async sendMessage(recipientId: string, text: string): Promise<void> {
        try {
            const response = await axios.post(
                `${env.INSTAGRAM_BASE_URL}/${env.INSTAGRAM_BUSINESS_ID}/messages`,
                {
                    recipient: { id: recipientId },
                    message: { text },
                },
                {
                    headers: {
                        Authorization: `Bearer ${env.INSTAGRAM_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            logger.info('Instagram message sent', {
                to: recipientId,
                messageId: response.data?.message_id,
            });
        } catch (err: any) {
            logger.error('Instagram API error', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
            throw new Error(`Instagram API failed: ${err.response?.data?.error?.message || err.message}`);
        }
    }

    /**
     * Parse incoming Instagram webhook payload.
     */
    static parseWebhookPayload(body: any): Array<{
        senderId: string;
        text: string;
        messageId: string;
        timestamp: number;
    }> {
        const messages: Array<{
            senderId: string;
            text: string;
            messageId: string;
            timestamp: number;
        }> = [];

        try {
            const entries = body?.entry || [];
            for (const entry of entries) {
                const messagingEvents = [
                    ...(entry?.messaging || []),
                    ...(entry?.standby || []),
                ];
                for (const event of messagingEvents) {
                    // Skip echoes (messages sent by the page itself)
                    if (event.message?.is_echo) continue;

                    if (event.message?.text) {
                        messages.push({
                            senderId: event.sender?.id || '',
                            text: event.message.text,
                            messageId: event.message.mid || '',
                            timestamp: event.timestamp || Date.now(),
                        });
                    }
                }
            }
        } catch (err) {
            logger.error('Failed to parse Instagram webhook', { error: (err as Error).message });
        }

        return messages;
    }
}
