import React from 'react';
import type { ChatMessageType } from '../../types/chat';
import { FaUser } from 'react-icons/fa';

interface MessageItemProps {
  message: ChatMessageType;
  avatar?: string;
  isMe?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, avatar }) => {
  return (
    <div className="message-row">
      {/* Avatar người gửi */}
      {avatar ? (
        <img
          src={avatar}
          alt={message.name}
          className="message-sender-avatar"
        />
      ) : (
        <div className="message-sender-avatar-placeholder">
          <FaUser />
        </div>
      )}

      {/* messageContent */}
      <div className="message-content-group">
        <div className="message-header-info">
          <span className="message-sender-name">{message.name}</span>
          <span className="message-time">{message.createAt}</span>
        </div>

        <div className="message-bubble">{message.mes}</div>
      </div>
    </div>
  );
};
