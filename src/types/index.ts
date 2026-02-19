// ─── Enums ──────────────────────────────────────────

export type UserRole = 'admin' | 'staff';

export type Platform = 'whatsapp' | 'instagram';

export type ConversationStatus = 'open' | 'resolved';

export type SenderType = 'customer' | 'staff';

// ─── Database Row Types ─────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    created_at: string;
}

export interface Customer {
    id: string;
    platform: Platform;
    platform_user_id: string;
    name: string | null;
    phone_number: string | null;
    created_at: string;
}

export interface Conversation {
    id: string;
    customer_id: string;
    platform: Platform;
    status: ConversationStatus;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_type: SenderType;
    content: string;
    platform: Platform;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    conversation_id: string;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

// ─── API DTOs ───────────────────────────────────────

export interface LoginDTO {
    email: string;
    password: string;
}

export interface CreateStaffDTO {
    name: string;
    email: string;
    password: string;
}

export interface AssignConversationDTO {
    staff_id: string;
}

export interface ReplyMessageDTO {
    content: string;
}

export interface UpdateConversationStatusDTO {
    status: ConversationStatus;
}

// ─── Auth Payload ───────────────────────────────────

export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}

// ─── API Responses ──────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// ─── Paginated Response ─────────────────────────────

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
