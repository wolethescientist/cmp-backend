import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { swaggerSpec } from './docs/swagger';

const app = express();

// ─── Security ────────────────────────────────────────
app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
app.use(cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    credentials: true,
}));

// ─── Rate Limiting ───────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// ─── Body Parsing ────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ─────────────────────────────────
app.use((req, res, next) => {
    const start = Date.now();
    logger.info(`→ ${req.method} ${req.originalUrl}`);

    res.on('finish', () => {
        const duration = Date.now() - start;
        const msg = `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

        if (res.statusCode >= 400) {
            logger.error(msg);
        } else {
            logger.info(msg);
        }
    });

    next();
});

// ─── Health Check ────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Central Messaging Platform is running.',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// ─── API Documentation ───────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CMP API Docs',
}));

app.get('/redoc', (_req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html><head>
        <title>CMP API Docs — ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>body { margin: 0; padding: 0; }</style>
    </head><body>
        <div id="redoc-container"></div>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        <script>
            Redoc.init(${JSON.stringify(swaggerSpec)}, {
                theme: {
                    colors: { primary: { main: '#6366f1' } },
                    typography: { fontFamily: 'Inter, sans-serif' },
                },
                hideDownloadButton: false,
            }, document.getElementById('redoc-container'));
        </script>
    </body></html>
    `);
});

app.get('/api-spec.json', (_req, res) => {
    res.json(swaggerSpec);
});

// ─── API Routes ──────────────────────────────────────
app.use('/api', apiRoutes);

// ─── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found.',
    });
});

// ─── Global Error Handler ────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────
app.listen(env.PORT, () => {
    const baseUrl = process.env.BASE_URL || `http://localhost:${env.PORT}`;
    logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📡 Health check: ${baseUrl}/health`);
    logger.info(`📖 Swagger UI: ${baseUrl}/docs`);
    logger.info(`📘 ReDoc: ${baseUrl}/redoc`);
    logger.info(`📨 WhatsApp webhook: ${baseUrl}/api/webhooks/whatsapp`);
    logger.info(`📸 Instagram webhook: ${baseUrl}/api/webhooks/instagram`);
});

export default app;
