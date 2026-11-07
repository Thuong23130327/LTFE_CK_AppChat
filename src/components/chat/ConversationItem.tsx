import React from 'react';
import type { ConversationItemType } from '../../types/chat';

interface Props {
    data: ConversationItemType; // Dùng thẳng kiểu gốc từ file chat.ts
    isActive: boolean;
    onClick: () => void;
}

export const ConversationItem: React.FC<Props> = ({ data, isActive, onClick }) => {
    // Vẫn giữ lại fallback đề phòng API trả về null/undefined
    const avatarUrl = data.avatar || `https://ui-avatars.com/api/?name=${data.name}&background=random`;
    const messagePreview = data.lastMessage || 'Chưa có tin nhắn...';

    return (
        <div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="avatar-container">
                <img src={avatarUrl} alt="avatar" className="avatar" />
                {data.isOnline && <div className="online-dot"></div>}
            </div>

            <div className="conversation-info">
                <div className="conversation-header">
                    <span className="name">
                        {data.type === 1 ? '👥 ' : '👤 '}
                        {data.name}
                    </span>
                    <span className="time">{data.actionTime}</span>
                </div>
                <div className="last-message">
                    {messagePreview}
                </div>
            </div>
        </div>
    );
};