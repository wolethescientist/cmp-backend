import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';

export class MessageController {
    /**
     * GET /api/conversations/:conversationId/messages — Get messages for a conversation.
     */
    static async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user!;
            const { page, limit } = req.query;

            const result = await MessageService.getMessages(
                req.params.conversationId as string,
                user.role,
                user.userId,
                page ? parseInt(page as string, 10) : 1,
                limit ? parseInt(limit as string, 10) : 50,
            );

            const p = page ? parseInt(page as string, 10) : 1;
            const l = limit ? parseInt(limit as string, 10) : 50;

            res.status(200).json({
                success: true,
                data: result.messages,
                pagination: {
                    page: p,
                    limit: l,
                    total: result.total,
                    totalPages: Math.ceil(result.total / l),
                },
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/conversations/:conversationId/reply — Reply to a conversation.
     */
    static async reply(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user!;
            const { content } = req.body;

            const message = await MessageService.replyToConversation(
                req.params.conversationId as string,
                content,
                user.role,
                user.userId,
            );

            res.status(201).json({
                success: true,
                data: message,
                message: 'Reply sent successfully.',
            });
        } catch (err) {
            next(err);
        }
    }
}
