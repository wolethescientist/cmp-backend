'use client';

import { useEffect, useState } from 'react';
import ConversationList from '@/components/ConversationList';
import ChatWindow from '@/components/ChatWindow';
import { Conversation } from '@/lib/types';
import { getConversations } from '@/lib/api';
import styles from '@/app/dashboard/DashboardPage.module.css'; // Reusing layout

interface PlatformInboxProps {
    platform: 'whatsapp' | 'instagram';
}

export default function PlatformInbox({ platform }: PlatformInboxProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load conversations on mount or platform change
    useEffect(() => {
        loadConversations();
        // Auto-polling removed as requested
    }, [platform]); // Reload if platform changes

    const loadConversations = async () => {
        try {
            // Pass platform to API
            const data = await getConversations('open', 1, platform);
            console.log(`[PlatformInbox] Fetched ${data.length} conversations for ${platform}`, data);
            setConversations(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load conversations', err);
            setLoading(false);
        }
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
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
                onUpdate={loadConversations}
            />
        </div>
    );
}
