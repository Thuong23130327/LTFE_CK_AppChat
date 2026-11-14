import React from 'react';
import type { ConversationItemType } from '../../types/chat';

interface Props {
    data: ConversationItemType;
    isActive: boolean;
    onClick: () => void;
    onLeaveRoom?: (roomName: string) => void;
}

export const ConversationItem: React.FC<Props> = ({
                                                      data,
                                                      isActive,
                                                      onClick,
                                                      onLeaveRoom,
                                                  }) => {
    const avatarUrl =
        data.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
    const messagePreview =
        data.lastMessage || (data.type === 1 ? 'Nhóm trò chuyện' : 'Nhấn để nhắn tin');

    const formattedTime = data.actionTime?.includes(' ')
        ? data.actionTime.split(' ')[1].slice(0, 5)
        : data.actionTime;

    return (
        <div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="avatar-container">
                <img src={avatarUrl} alt="avatar" className="avatar" />
                {data.type === 0 && data.isOnline && <div className="online-dot"></div>}
            </div>

            <div className="conversation-info">
                <div className="conversation-header">
                    <span className="name">
                        {data.type === 1 ? '👥 ' : '👤 '}
                        {data.name}
                    </span>
                    <span className="time">{formattedTime}</span>
                </div>
                <div
                    className="last-message"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {messagePreview}
                    </span>
                    {data.type === 1 && onLeaveRoom && (
                        <button
                            title="Rời phòng"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLeaveRoom(data.name);
                            }}
                            style={{
                                marginLeft: '6px',
                                fontSize: '11px',
                                padding: '2px 6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                background: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            Rời
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};