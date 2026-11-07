import React from 'react';
import { ConversationItemType } from '../../types/chat';

interface Props {
    data: ConversationItemType;
    isActive: boolean;
    onClick: () => void;
}

export const ConversationItem: React.FC<Props> = ({ data, isActive, onClick }) => {
    return (
        <div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="avatar-container">
                <img src={data.avatar} alt="avatar" className="avatar" />
                {/* Chấm tròn xanh lá báo online */}
                {/* {data.isOnline && <div className="online-dot"></div>} */}
            </div>

            <div className="conversation-info">
                <div className="conversation-header">
          <span className="name">
            {data.type === 1 ? '👥 ' : '👤 '}
              {data.name}
          </span>
                    <span className="time">{data.time}</span>
                </div>
                <div className="last-message">
                    {data.lastMessage}
                </div>
            </div>
        </div>
    );
};