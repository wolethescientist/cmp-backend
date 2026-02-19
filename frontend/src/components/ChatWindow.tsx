'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added useRef
import { Send, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Conversation, Message } from '@/lib/types';
import { getMessages, sendMessage, updateStatus } from '@/lib/api';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
    conversation: Conversation | null;
    onUpdate: () => void;
}

export default function ChatWindow({ conversation, onUpdate }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (conversation) {
            loadMessages();
            // Auto-polling removed as requested
            // const interval = setInterval(loadMessages, 5000);
            // return () => clearInterval(interval);
        }
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        if (!conversation) return;
        try {
            const msgs = await getMessages(conversation.id);
            // Sort messages by date (ascending)
            setMessages(msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !conversation) return;
        setSending(true);
        try {
            await sendMessage(conversation.id, input);
            setInput('');
            await loadMessages();
            onUpdate(); // Refresh last message in list
        } catch (err) {
            console.error('Failed to send message', err);
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        if (!conversation) return;
        try {
            const newStatus = conversation.status === 'open' ? 'resolved' : 'open';
            await updateStatus(conversation.id, newStatus);
            onUpdate(); // Refresh status in list
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    if (!conversation) {
        return (
            <div className={styles.emptyState}>
                <div className="text-xl font-bold">No conversation selected</div>
                <div className="text-sm">Select a conversation from the list to start chatting</div>
            </div>
        );
    }

    return (
        <div className={styles.window}>
            <header className={styles.header}>
                <div className={styles.contactInfo}>
                    <h2 className={styles.contactName}>{conversation.customers.name || conversation.customers.phone_number || 'Unknown'}</h2>
                    <div className={styles.platformInfo}>{conversation.platform} • {conversation.status}</div>
                </div>
                <div className={styles.actions}>
                    <button onClick={handleResolve} className={styles.resolveButton}>
                        {conversation.status === 'open' ? 'Resolve' : 'Reopen'}
                    </button>
                </div>
            </header>

            <div className={styles.messagesArea}>
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            className={`${styles.messageRow} ${msg.sender_type === 'staff' ? styles.staff : styles.customer}`}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={styles.bubble}>
                                {msg.content}
                                <span className={styles.meta}>{format(new Date(msg.created_at), 'HH:mm')}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <textarea
                    className={styles.textarea}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <button className={styles.sendButton} onClick={handleSend} disabled={sending || !input.trim()}>
                    {sending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                </button>
            </div>
        </div>
    );
}
