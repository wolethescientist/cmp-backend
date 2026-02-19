'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Instagram, Search } from 'lucide-react';
import { Conversation } from '@/lib/types';
import styles from './Conversations.module.css';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    loading?: boolean;
}

export default function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations.filter((conv) => {
        const term = searchTerm.toLowerCase();
        const name = (conv.customers.name || conv.customers.phone_number || '').toLowerCase();
        // Safely access last message content
        const lastMsg = (conv.last_message?.content || '').toLowerCase();
        return name.includes(term) || lastMsg.includes(term);
    });

    const getIcon = (platform: string) => {
        return platform === 'whatsapp' ? <MessageCircle className="text-green-500" /> : <Instagram className="text-pink-500" />;
    };

    const getStatusColor = (status: string) => {
        return status === 'open' ? styles.open : styles.resolved;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Inbox</h2>
                <div className={styles.count}>{filteredConversations.length}</div>
            </div>

            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.list}>
                {filteredConversations.map((conv) => (
                    <div
                        key={conv.id}
                        className={`${styles.item} ${selectedId === conv.id ? styles.active : ''}`}
                        onClick={() => onSelect(conv.id)}
                    >
                        <div className={styles.avatar}>
                            {getIcon(conv.platform)}
                            <div className={`${styles.statusIndicator} ${getStatusColor(conv.status)}`} />
                        </div>

                        <div className={styles.content}>
                            <div className={styles.nameRow}>
                                <span className={styles.name}>{conv.customers.name || conv.customers.phone_number || 'Unknown'}</span>
                                <span className={styles.time}>
                                    {conv.last_message?.created_at || conv.created_at ? formatDistanceToNow(new Date(conv.last_message?.created_at || conv.created_at), { addSuffix: true }) : ''}
                                </span>
                            </div>

                            <div className={`${styles.messagePreview} ${conv.status === 'open' ? styles.unread : ''}`}>
                                {conv.last_message?.content || 'New conversation'}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredConversations.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No conversations found</div>
                )}
            </div>
        </div>
    );
}
