import axios from 'axios';
import { Conversation, Message, Notification, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Authentication
export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
};

export const register = async (name: string, email: string, password: string, role: 'admin' | 'staff' = 'staff') => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    return data.data;
};

export const getMe = async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.data;
};

// Conversations
export const getConversations = async (status: 'open' | 'resolved' = 'open', page = 1) => {
    const { data } = await api.get('/conversations', { params: { status, page } });
    return data.data as Conversation[];
};

export const getConversation = async (id: string, includeMessages = true) => {
    const { data } = await api.get(`/conversations/${id}`);
    return data.data;
};

// Messages
export const getMessages = async (conversationId: string, page = 1) => {
    const { data } = await api.get(`/conversations/${conversationId}/messages`, { params: { page } });
    return data.data as Message[];
};

export const sendMessage = async (conversationId: string, content: string) => {
    const { data } = await api.post(`/conversations/${conversationId}/reply`, { content });
    return data.data;
};

export const updateStatus = async (conversationId: string, status: 'open' | 'resolved') => {
    const { data } = await api.patch(`/conversations/${conversationId}/status`, { status });
    return data.data;
};

// Staff (Admin only)
export const assignStaff = async (conversationId: string, staffId: string) => {
    const { data } = await api.post(`/conversations/${conversationId}/assign`, { staff_id: staffId });
    return data.data;
};

export const getStaff = async () => {
    const { data } = await api.get('/staff');
    return data.data as User[];
};

// Notifications
export const getNotifications = async (unreadOnly = true) => {
    const { data } = await api.get('/notifications', { params: { unread: unreadOnly } });
    return data.data as Notification[];
};

export const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
};

export const markAllRead = async () => {
    await api.patch('/notifications/read-all');
};

export default api;
