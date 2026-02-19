export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Central Messaging Platform API',
        description:
            'Private Messaging Management System for WhatsApp & Instagram. Manage customer conversations, staff assignments, and message replies through a unified REST API.',
        version: '1.0.0',
        contact: { name: 'Admin' },
    },
    servers: [
        { url: 'https://cmp-backend-sws6.onrender.com', description: 'Production (Render)' },
        { url: 'http://localhost:3000', description: 'Local Development' },
    ],
    tags: [
        { name: 'Auth', description: 'Authentication & registration' },
        { name: 'Staff', description: 'Staff management (admin only)' },
        { name: 'Conversations', description: 'Conversation listing, assignment & status' },
        { name: 'Messages', description: 'Message retrieval & replies' },
        { name: 'Notifications', description: 'Staff notifications' },
        { name: 'Webhooks', description: 'Meta webhook endpoints (WhatsApp & Instagram)' },
        { name: 'Health', description: 'Server health check' },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            // ─── Request Bodies ──────────────────────────
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@example.com' },
                    password: { type: 'string', minLength: 6, example: 'securepassword' },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', minLength: 6, example: 'securepassword' },
                    role: { type: 'string', enum: ['admin', 'staff'], default: 'staff' },
                },
            },
            CreateStaffRequest: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', example: 'Jane Staff' },
                    email: { type: 'string', format: 'email', example: 'jane@example.com' },
                    password: { type: 'string', minLength: 6, example: 'password123' },
                },
            },
            AssignConversationRequest: {
                type: 'object',
                required: ['staff_id'],
                properties: {
                    staff_id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
                },
            },
            UpdateStatusRequest: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['open', 'resolved'] },
                },
            },
            ReplyRequest: {
                type: 'object',
                required: ['content'],
                properties: {
                    content: { type: 'string', example: 'Hello! How can I help you?' },
                },
            },
            // ─── Response Models ─────────────────────────
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['admin', 'staff'] },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            Customer: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    platform: { type: 'string', enum: ['whatsapp', 'instagram'] },
                    platform_user_id: { type: 'string' },
                    name: { type: 'string', nullable: true },
                    phone_number: { type: 'string', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            Conversation: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    customer_id: { type: 'string', format: 'uuid' },
                    platform: { type: 'string', enum: ['whatsapp', 'instagram'] },
                    status: { type: 'string', enum: ['open', 'resolved'] },
                    assigned_to: { type: 'string', format: 'uuid', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                    customers: { $ref: '#/components/schemas/Customer' },
                    users: { $ref: '#/components/schemas/User' },
                },
            },
            Message: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    conversation_id: { type: 'string', format: 'uuid' },
                    sender_type: { type: 'string', enum: ['customer', 'staff'] },
                    content: { type: 'string' },
                    platform: { type: 'string', enum: ['whatsapp', 'instagram'] },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            Notification: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    user_id: { type: 'string', format: 'uuid' },
                    conversation_id: { type: 'string', format: 'uuid' },
                    type: { type: 'string' },
                    message: { type: 'string' },
                    is_read: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            Pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                },
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    data: {},
                    message: { type: 'string' },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' },
                },
            },
        },
    },
    paths: {
        // ─── Health ──────────────────────────────────────
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                responses: {
                    200: {
                        description: 'Server is running',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        timestamp: { type: 'string', format: 'date-time' },
                                        environment: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        // ─── Auth ────────────────────────────────────────
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login',
                description: 'Authenticate with email and password. Returns a JWT token.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                token: { type: 'string' },
                                                user: { $ref: '#/components/schemas/User' },
                                            },
                                        },
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register user',
                description: 'Register a new admin or staff user. Use for initial setup.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
                },
                responses: {
                    201: {
                        description: 'User registered',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' }, message: { type: 'string' } } } } },
                    },
                    409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current user',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Current user info', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        // ─── Staff ───────────────────────────────────────
        '/api/staff': {
            post: {
                tags: ['Staff'],
                summary: 'Create staff member',
                description: 'Admin only. Creates a new staff account.',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStaffRequest' } } },
                },
                responses: {
                    201: { description: 'Staff created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' }, message: { type: 'string' } } } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Email exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
            get: {
                tags: ['Staff'],
                summary: 'List all staff',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Staff list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } } },
                },
            },
        },
        '/api/staff/{id}': {
            get: {
                tags: ['Staff'],
                summary: 'Get staff member',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: {
                    200: { description: 'Staff details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
            delete: {
                tags: ['Staff'],
                summary: 'Delete staff member',
                description: 'Unassigns all conversations before deletion.',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: {
                    200: { description: 'Staff deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/api/staff/{id}/activity': {
            get: {
                tags: ['Staff'],
                summary: 'Get staff activity',
                description: 'View assigned conversations count, messages sent, and recent replies.',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: {
                    200: {
                        description: 'Activity report',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                staff: { $ref: '#/components/schemas/User' },
                                                assignedConversations: { type: 'integer' },
                                                messagesSent: { type: 'integer' },
                                                recentReplies: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        // ─── Conversations ───────────────────────────────
        '/api/conversations': {
            get: {
                tags: ['Conversations'],
                summary: 'List conversations',
                description: 'Admin sees all conversations. Staff sees only assigned conversations.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'platform', in: 'query', schema: { type: 'string', enum: ['whatsapp', 'instagram'] } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'resolved'] } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                ],
                responses: {
                    200: {
                        description: 'Paginated conversation list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Conversation' } },
                                        pagination: { $ref: '#/components/schemas/Pagination' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/conversations/{id}': {
            get: {
                tags: ['Conversations'],
                summary: 'Get conversation with messages',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: {
                    200: {
                        description: 'Conversation details with messages',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            allOf: [
                                                { $ref: '#/components/schemas/Conversation' },
                                                { type: 'object', properties: { messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } } } },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/api/conversations/{id}/assign': {
            post: {
                tags: ['Conversations'],
                summary: 'Assign conversation to staff',
                description: 'Admin only. Assigns a conversation and sends a notification to the staff member.',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignConversationRequest' } } },
                },
                responses: {
                    200: { description: 'Assigned', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Conversation' }, message: { type: 'string' } } } } } },
                    404: { description: 'Conversation or staff not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/api/conversations/{id}/status': {
            patch: {
                tags: ['Conversations'],
                summary: 'Update conversation status',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateStatusRequest' } } },
                },
                responses: {
                    200: { description: 'Status updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Conversation' }, message: { type: 'string' } } } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        // ─── Messages ────────────────────────────────────
        '/api/conversations/{conversationId}/messages': {
            get: {
                tags: ['Messages'],
                summary: 'Get messages for a conversation',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'conversationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
                ],
                responses: {
                    200: {
                        description: 'Paginated messages',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                                        pagination: { $ref: '#/components/schemas/Pagination' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/conversations/{conversationId}/reply': {
            post: {
                tags: ['Messages'],
                summary: 'Reply to a conversation',
                description: 'Sends a message via the platform API (WhatsApp/Instagram) and stores it.',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'conversationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ReplyRequest' } } },
                },
                responses: {
                    201: { description: 'Reply sent', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Message' }, message: { type: 'string' } } } } } },
                    400: { description: 'Conversation is resolved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    502: { description: 'Platform API failure', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        // ─── Notifications ───────────────────────────────
        '/api/notifications': {
            get: {
                tags: ['Notifications'],
                summary: 'Get notifications',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'unread', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filter unread only' },
                ],
                responses: {
                    200: { description: 'Notifications list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } } },
                },
            },
        },
        '/api/notifications/{id}/read': {
            patch: {
                tags: ['Notifications'],
                summary: 'Mark notification as read',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: {
                    200: { description: 'Marked as read', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
                },
            },
        },
        '/api/notifications/read-all': {
            patch: {
                tags: ['Notifications'],
                summary: 'Mark all notifications as read',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'All marked as read', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
                },
            },
        },
        // ─── Webhooks ────────────────────────────────────
        '/api/webhooks/whatsapp': {
            get: {
                tags: ['Webhooks'],
                summary: 'WhatsApp webhook verification',
                description: 'Meta calls this endpoint to verify the webhook URL.',
                parameters: [
                    { name: 'hub.mode', in: 'query', schema: { type: 'string' } },
                    { name: 'hub.verify_token', in: 'query', schema: { type: 'string' } },
                    { name: 'hub.challenge', in: 'query', schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Verification successful' },
                    403: { description: 'Verification failed' },
                },
            },
            post: {
                tags: ['Webhooks'],
                summary: 'Receive WhatsApp messages',
                description: 'Meta sends incoming WhatsApp messages to this endpoint.',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
                responses: { 200: { description: 'Acknowledged' } },
            },
        },
        '/api/webhooks/instagram': {
            get: {
                tags: ['Webhooks'],
                summary: 'Instagram webhook verification',
                parameters: [
                    { name: 'hub.mode', in: 'query', schema: { type: 'string' } },
                    { name: 'hub.verify_token', in: 'query', schema: { type: 'string' } },
                    { name: 'hub.challenge', in: 'query', schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Verification successful' },
                    403: { description: 'Verification failed' },
                },
            },
            post: {
                tags: ['Webhooks'],
                summary: 'Receive Instagram messages',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
                responses: { 200: { description: 'Acknowledged' } },
            },
        },
    },
};
