import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { ConversationService } from '../services/conversation.service';
import { MessageService } from '../services/message.service';

export class TestController {
    static async seed(req: Request, res: Response): Promise<void> {
        try {
            // Create dummy customer
            const customer = await CustomerService.findOrCreateCustomer({
                platform: 'instagram',
                platformUserId: 'dummy_user_123',
                name: 'Test User',
            });

            // Create conversation
            const conversation = await ConversationService.findOrCreateConversation(
                customer.id,
                'instagram'
            );

            // Add dummy message
            await MessageService.storeMessage({
                conversationId: conversation.id,
                senderType: 'customer',
                content: 'Hello! This is a test message to verify the dashboard.',
                platform: 'instagram',
            });

            res.json({ success: true, message: 'Seeded successfully' });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
