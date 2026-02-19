'use client';

import { useEffect, useState } from 'react';
import ConversationList from '@/components/ConversationList';
import ChatWindow from '@/components/ChatWindow';
import { Conversation } from '@/lib/types';
import { getConversations, getConversation } from '@/lib/api';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Poll for conversation updates
    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 10000); // Poll list every 10s
        return () => clearInterval(interval);
    }, []);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load conversations', err);
            setLoading(false);
        }
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
        // Mark messages as read logic could go here
    };

    const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

    return (
        <div className={styles.container}>
            <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={handleSelect}
                loading={loading}
            />
            <ChatWindow
                conversation={selectedConversation}
                onUpdate={loadConversations} // Refresh list when message sent or resolved
            />
        </div>
    );
}
