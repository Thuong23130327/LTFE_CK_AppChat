import React, { useState } from 'react';
import { ConversationItem } from './ConversationItem';
import { mockConversations } from '../../data/mockConversations';

export const Sidebar: React.FC = () => {
    const [activeId, setActiveId] = useState<string>('');

    return (
        <div className="sidebar-container">
            {/* 1. Header Sidebar */}
            <div className="sidebar-header">
                <div className="current-user">
                    <img src="https://i.pravatar.cc/150?u=phat" alt="My Avatar" className="avatar-small" />
                    <span className="username">Tấn Phát</span>
                </div>
                <div className="sidebar-actions">
                    <button title="Tạo phòng mới">➕</button>
                    <button title="Đăng xuất">🚪</button>
                </div>
            </div>

            {/* 2. Thanh tìm kiếm */}
            <div className="sidebar-search">
                <input type="text" placeholder="Tìm kiếm bạn bè, nhóm..." />
            </div>

            {/* 3. Danh sách hội thoại (Có thanh cuộn) */}
            <div className="conversation-list">
                {mockConversations.map(conv => (
                    <ConversationItem
                        key={conv.id}
                        data={conv}
                        isActive={activeId === conv.id}
                        onClick={() => setActiveId(conv.id)}
                    />
                ))}
            </div>
        </div>
    );
};