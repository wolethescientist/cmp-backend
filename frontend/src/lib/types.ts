export type Platform = 'whatsapp' | 'instagram';
export type ConversationStatus = 'open' | 'resolved';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff';
}

export interface Customer {
    id: string;
    platform: Platform;
    platform_user_id: string;
    name: string | null;
    phone_number: string | null;
}

export interface Conversation {
    id: string;
    customer_id: string;
    platform: Platform;
    status: ConversationStatus;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
    customers: Customer;
    users?: User | null; // assigned staff
    last_message?: Message;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_type: 'customer' | 'staff';
    content: string;
    platform: Platform;
    created_at: string;
}

export interface Notification {
    id: string;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
}
