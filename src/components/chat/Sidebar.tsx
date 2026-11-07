import React, { useState } from 'react';
import './Sidebar.css';
import { ConversationItem } from './ConversationItem';
import { mockConversations } from '../../data/mockConversations';

export const Sidebar: React.FC = () => {
    const [activeId, setActiveId] = useState<string>('');

    return (
        // Đổi thành sidebar-wrapper để nhận CSS layout từ App.css (chiếm 30% width)
        <div className="sidebar-wrapper">

            {/* 1. Header Sidebar - Nhận padding và border-bottom từ App.css */}
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="current-user" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="https://i.pravatar.cc/150?u=phat" alt="My Avatar" className="avatar-small" />
                    <span className="username" style={{ marginLeft: '8px' }}>Tấn Phát</span>
                </div>
                <div className="sidebar-actions">
                    <button title="Tạo phòng mới" style={{ marginRight: '8px', cursor: 'pointer' }}>➕</button>
                    <button title="Đăng xuất" style={{ cursor: 'pointer' }}>🚪</button>
                </div>
            </div>

            {/* 2. Thanh tìm kiếm - Để bên ngoài sidebar-content để luôn cố định khi cuộn */}
            <div className="sidebar-search" style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
                <input
                    type="text"
                    placeholder="Tìm kiếm bạn bè, nhóm..."
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        boxSizing: 'border-box' // Tránh bị tràn thanh input ra ngoài
                    }}
                />
            </div>

            {/* 3. Danh sách hội thoại */}
            <div className="sidebar-content" style={{ padding: 0 }}>
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

        </div>
    );
};