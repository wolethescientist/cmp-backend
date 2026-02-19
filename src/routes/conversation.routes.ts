import { Router } from 'express';
import { body } from 'express-validator';
import { ConversationController } from '../controllers/conversation.controller';
import { MessageController } from '../controllers/message.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All conversation routes require authentication
router.use(authenticate);

/**
 * GET /api/conversations — List conversations (role-scoped).
 */
router.get('/', ConversationController.list);

/**
 * GET /api/conversations/:id — Get a conversation with messages.
 */
router.get('/:id', ConversationController.getById);

/**
 * POST /api/conversations/:id/assign — Assign conversation to staff (admin only).
 */
router.post(
    '/:id/assign',
    authorize('admin'),
    validate([
        body('staff_id').isUUID().withMessage('Valid staff_id (UUID) is required.'),
    ]),
    ConversationController.assign,
);

/**
 * PATCH /api/conversations/:id/status — Update conversation status.
 */
router.patch(
    '/:id/status',
    validate([
        body('status').isIn(['open', 'resolved']).withMessage('Status must be "open" or "resolved".'),
    ]),
    ConversationController.updateStatus,
);

/**
 * GET /api/conversations/:conversationId/messages — Get messages.
 */
router.get('/:conversationId/messages', MessageController.getMessages);

/**
 * POST /api/conversations/:conversationId/reply — Reply to conversation.
 */
router.post(
    '/:conversationId/reply',
    validate([
        body('content').trim().notEmpty().withMessage('Message content is required.'),
    ]),
    MessageController.reply,
);

export default router;
