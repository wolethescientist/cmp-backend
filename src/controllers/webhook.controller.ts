import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { WhatsappService } from '../services/whatsapp.service';
import { InstagramService } from '../services/instagram.service';
import { CustomerService } from '../services/customer.service';
import { ConversationService } from '../services/conversation.service';
import { MessageService } from '../services/message.service';

export class WebhookController {
    // ──────────────────────────────────────────────────────
    // WhatsApp
    // ──────────────────────────────────────────────────────

    /**
     * GET /api/webhooks/whatsapp — Verification endpoint.
     */
    static whatsappVerify(req: Request, res: Response): void {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
            logger.info('WhatsApp webhook verified');
            res.status(200).send(challenge);
        } else {
            logger.warn('WhatsApp webhook verification failed', { mode, token });
            res.sendStatus(403);
        }
    }

    /**
     * POST /api/webhooks/whatsapp — Receive incoming messages.
     */
    static async whatsappReceive(req: Request, res: Response, next: NextFunction): Promise<void> {
        // Immediately respond 200 to Meta (they retry on non-200)
        res.sendStatus(200);

        try {
            const incomingMessages = WhatsappService.parseWebhookPayload(req.body);

            for (const msg of incomingMessages) {
                logger.info('WhatsApp incoming message', { from: msg.from, name: msg.name });

                // 1. Find or create customer
                const customer = await CustomerService.findOrCreateCustomer({
                    platform: 'whatsapp',
                    platformUserId: msg.from,
                    name: msg.name,
                    phoneNumber: msg.from,
                });

                // 2. Find or create conversation
                const conversation = await ConversationService.findOrCreateConversation(
                    customer.id,
                    'whatsapp',
                );

                // 3. Store the message
                await MessageService.storeMessage({
                    conversationId: conversation.id,
                    senderType: 'customer',
                    content: msg.text,
                    platform: 'whatsapp',
                });

                logger.info('WhatsApp message stored', {
                    conversationId: conversation.id,
                    customerId: customer.id,
                });
            }
        } catch (err) {
            // Don't re-throw since we already sent 200
            logger.error('Error processing WhatsApp webhook', { error: (err as Error).message });
        }
    }

    // ──────────────────────────────────────────────────────
    // Instagram
    // ──────────────────────────────────────────────────────

    /**
     * GET /api/webhooks/instagram — Verification endpoint.
     */
    static instagramVerify(req: Request, res: Response): void {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
            logger.info('Instagram webhook verified');
            res.status(200).send(challenge);
        } else {
            logger.warn('Instagram webhook verification failed', { mode, token });
            res.sendStatus(403);
        }
    }

    /**
     * POST /api/webhooks/instagram — Receive incoming messages.
     */
    static async instagramReceive(req: Request, res: Response, next: NextFunction): Promise<void> {
        // Immediately respond 200 to Meta
        res.sendStatus(200);

        // Debug: Log the entire payload
        logger.info('Instagram webhook payload received', { body: JSON.stringify(req.body) });

        try {
            const incomingMessages = InstagramService.parseWebhookPayload(req.body);

            for (const msg of incomingMessages) {
                logger.info('Instagram incoming message', { senderId: msg.senderId });

                // 1. Find or create customer
                const customer = await CustomerService.findOrCreateCustomer({
                    platform: 'instagram',
                    platformUserId: msg.senderId,
                });

                // 2. Find or create conversation
                const conversation = await ConversationService.findOrCreateConversation(
                    customer.id,
                    'instagram',
                );

                // 3. Store the message
                await MessageService.storeMessage({
                    conversationId: conversation.id,
                    senderType: 'customer',
                    content: msg.text,
                    platform: 'instagram',
                });

                logger.info('Instagram message stored', {
                    conversationId: conversation.id,
                    customerId: customer.id,
                });
            }
        } catch (err) {
            logger.error('Error processing Instagram webhook', { error: (err as Error).message });
        }
    }
}
