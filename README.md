# Central Messaging Platform

A production-ready **Private Messaging Management System** built with **Node.js + TypeScript** and **Supabase**. Manages customer conversations from **WhatsApp** and **Instagram** through a unified backend with role-based access control.

---

## 🏗 Architecture

```
src/
├── config/           # Environment, Supabase client, logger
│   ├── env.ts
│   ├── supabase.ts
│   └── logger.ts
├── controllers/      # Request handlers
│   ├── auth.controller.ts
│   ├── staff.controller.ts
│   ├── conversation.controller.ts
│   ├── message.controller.ts
│   ├── notification.controller.ts
│   └── webhook.controller.ts
├── database/         # SQL schema & migration
│   ├── schema.sql
│   └── migrate.ts
├── middleware/        # Auth, validation, error handling
│   ├── auth.ts
│   ├── validate.ts
│   └── errorHandler.ts
├── routes/           # Express route definitions
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── staff.routes.ts
│   ├── conversation.routes.ts
│   ├── notification.routes.ts
│   └── webhook.routes.ts
├── services/         # Business logic
│   ├── auth.service.ts
│   ├── staff.service.ts
│   ├── conversation.service.ts
│   ├── message.service.ts
│   ├── customer.service.ts
│   ├── notification.service.ts
│   ├── whatsapp.service.ts
│   └── instagram.service.ts
├── types/            # TypeScript interfaces & types
│   ├── index.ts
│   └── express.d.ts
└── index.ts          # Application entry point
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required variables:** `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, and all Meta/WhatsApp/Instagram API keys.

### 3. Set Up Database

Run the SQL in `src/database/schema.sql` in your **Supabase SQL Editor** (Dashboard → SQL Editor → New Query → Paste & Run).

This creates all tables, indexes, foreign keys, and triggers.

### 4. Create Admin User

Register the first admin user via the API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@example.com", "password": "securepassword", "role": "admin"}'
```

### 5. Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint           | Auth   | Description               |
|--------|--------------------|--------|---------------------------|
| POST   | `/api/auth/login`  | None   | Login, returns JWT        |
| POST   | `/api/auth/register` | None | Register user (bootstrap) |
| GET    | `/api/auth/me`     | Bearer | Get current user info     |

### Staff Management (Admin Only)

| Method | Endpoint                   | Description                |
|--------|----------------------------|----------------------------|
| POST   | `/api/staff`               | Create staff member        |
| GET    | `/api/staff`               | List all staff             |
| GET    | `/api/staff/:id`           | Get staff details          |
| DELETE | `/api/staff/:id`           | Delete staff member        |
| GET    | `/api/staff/:id/activity`  | Get staff activity report  |

### Conversations

| Method | Endpoint                            | Auth          | Description                  |
|--------|-------------------------------------|---------------|------------------------------|
| GET    | `/api/conversations`                | Bearer        | List conversations (scoped)  |
| GET    | `/api/conversations/:id`            | Bearer        | Get conversation + messages  |
| POST   | `/api/conversations/:id/assign`     | Admin Bearer  | Assign to staff              |
| PATCH  | `/api/conversations/:id/status`     | Bearer        | Update status (open/resolved)|

**Query params for listing:** `?platform=whatsapp|instagram`, `?status=open|resolved`, `?page=1`, `?limit=20`

### Messages

| Method | Endpoint                                       | Description              |
|--------|-------------------------------------------------|--------------------------|
| GET    | `/api/conversations/:id/messages`              | Get messages (paginated) |
| POST   | `/api/conversations/:id/reply`                 | Send reply               |

### Notifications

| Method | Endpoint                          | Description               |
|--------|-----------------------------------|---------------------------|
| GET    | `/api/notifications`              | Get notifications (?unread=true) |
| PATCH  | `/api/notifications/:id/read`     | Mark as read              |
| PATCH  | `/api/notifications/read-all`     | Mark all as read          |

### Webhooks (Meta)

| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET    | `/api/webhooks/whatsapp`    | WhatsApp verification            |
| POST   | `/api/webhooks/whatsapp`    | Receive WhatsApp messages        |
| GET    | `/api/webhooks/instagram`   | Instagram verification           |
| POST   | `/api/webhooks/instagram`   | Receive Instagram messages       |

### Health Check

| Method | Endpoint   | Description          |
|--------|------------|----------------------|
| GET    | `/health`  | Server status check  |

---

## 🔐 Authentication Flow

1. **Login** → `POST /api/auth/login` with `{email, password}` → returns `{token, user}`
2. **Use token** → Set `Authorization: Bearer <token>` header on all protected requests
3. **Role scoping** → Admin sees all data; Staff sees only assigned conversations

---

## 📨 Webhook Flow

1. Meta sends a message to `/api/webhooks/whatsapp` or `/api/webhooks/instagram`
2. The webhook controller parses the payload and immediately responds `200`
3. A **customer** record is found or created
4. A **conversation** is found (existing open) or created
5. The **message** is stored in the database
6. Admin/staff can view and reply through the API

---

## 🗄 Database Schema

- **users** — Admin and staff accounts
- **customers** — WhatsApp/Instagram users (auto-created from webhooks)
- **conversations** — Threads linking customers to staff, with status tracking
- **messages** — Individual messages with sender type, platform, and timestamps
- **notifications** — Staff alerts for conversation assignments

---

## 🛡 Security

- **Helmet** — HTTP security headers
- **CORS** — Cross-origin request handling
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **JWT** — Stateless authentication with configurable expiry
- **bcrypt** — Password hashing with 12 salt rounds
- **Input Validation** — express-validator on all endpoints
- **Role-Based Access** — Middleware-enforced authorization

---

## 📝 License

Private — All rights reserved.
