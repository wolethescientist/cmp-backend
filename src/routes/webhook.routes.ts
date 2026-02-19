import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

// ─── WhatsApp Webhooks ──────────────────────────────
router.get('/whatsapp', WebhookController.whatsappVerify);
router.post('/whatsapp', WebhookController.whatsappReceive);

// ─── Instagram Webhooks ─────────────────────────────
router.get('/instagram', WebhookController.instagramVerify);
router.post('/instagram', WebhookController.instagramReceive);

export default router;
