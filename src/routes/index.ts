import { Router } from 'express';
import authRoutes from './auth.routes';
import staffRoutes from './staff.routes';
import conversationRoutes from './conversation.routes';
import notificationRoutes from './notification.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/conversations', conversationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/webhooks', webhookRoutes);

import { TestController } from '../controllers/test.controller';
router.post('/seed', TestController.seed);

export default router;
