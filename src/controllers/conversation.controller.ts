import { Request, Response, NextFunction } from 'express';
import { ConversationService } from '../services/conversation.service';
import { Platform, ConversationStatus } from '../types';

export class ConversationController {
    /**
     * GET /api/conversations — List conversations (role-scoped).
     */
    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { platform, status, page, limit } = req.query;
            const user = req.user!;

            const result = await ConversationService.listConversations({
                role: user.role,
                userId: user.userId,
                platform: platform as Platform | undefined,
                status: status as ConversationStatus | undefined,
                page: page ? parseInt(page as string, 10) : 1,
                limit: limit ? parseInt(limit as string, 10) : 20,
            });

            const p = page ? parseInt(page as string, 10) : 1;
            const l = limit ? parseInt(limit as string, 10) : 20;

            res.status(200).json({
                success: true,
                data: result.conversations,
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
     * GET /api/conversations/:id — Get a conversation with messages.
     */
    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user!;
            const conversation = await ConversationService.getConversation(
                req.params.id as string,
                user.role,
                user.userId,
            );

            res.status(200).json({ success: true, data: conversation });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/conversations/:id/assign — Assign a conversation to staff (admin only).
     */
    static async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { staff_id } = req.body;
            const conversation = await ConversationService.assignConversation(req.params.id as string, staff_id);

            res.status(200).json({
                success: true,
                data: conversation,
                message: 'Conversation assigned successfully.',
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/conversations/:id/status — Update conversation status.
     */
    static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user!;
            const { status } = req.body;

            const conversation = await ConversationService.updateStatus(
                req.params.id as string,
                status,
                user.role,
                user.userId,
            );

            res.status(200).json({
                success: true,
                data: conversation,
                message: 'Status updated.',
            });
        } catch (err) {
            next(err);
        }
    }
}
