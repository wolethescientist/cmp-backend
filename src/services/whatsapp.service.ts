import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class WhatsappService {
    /**
     * Send a text message via WhatsApp Cloud API.
     */
    static async sendMessage(recipientPhone: string, text: string): Promise<void> {
        try {
            const response = await axios.post(
                env.WHATSAPP_BASE_URL,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: recipientPhone,
                    type: 'text',
                    text: { body: text },
                },
                {
                    headers: {
                        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            logger.info('WhatsApp message sent', {
                to: recipientPhone,
                messageId: response.data?.messages?.[0]?.id,
            });
        } catch (err: any) {
            logger.error('WhatsApp API error', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
            throw new Error(`WhatsApp API failed: ${err.response?.data?.error?.message || err.message}`);
        }
    }

    /**
     * Parse incoming WhatsApp webhook payload.
     */
    static parseWebhookPayload(body: any): Array<{
        from: string;
        name: string;
        text: string;
        messageId: string;
        timestamp: string;
    }> {
        const messages: Array<{
            from: string;
            name: string;
            text: string;
            messageId: string;
            timestamp: string;
        }> = [];

        try {
            const entries = body?.entry || [];
            for (const entry of entries) {
                const changes = entry?.changes || [];
                for (const change of changes) {
                    const value = change?.value;
                    if (!value || value.messaging_product !== 'whatsapp') continue;

                    const contacts = value.contacts || [];
                    const incomingMessages = value.messages || [];

                    for (const msg of incomingMessages) {
                        if (msg.type !== 'text') continue; // Only handle text messages for now

                        const contact = contacts.find((c: any) => c.wa_id === msg.from);
                        messages.push({
                            from: msg.from,
                            name: contact?.profile?.name || 'Unknown',
                            text: msg.text?.body || '',
                            messageId: msg.id,
                            timestamp: msg.timestamp,
                        });
                    }
                }
            }
        } catch (err) {
            logger.error('Failed to parse WhatsApp webhook', { error: (err as Error).message });
        }

        return messages;
    }
}
