import React from 'react';
import type { ChatMessageType } from '../../types/chat';
import { FaUser } from 'react-icons/fa';

export interface MessageBubbleProps {
  message?: ChatMessageType;
  text?: string;
  time?: string;
  senderName?: string;
  avatar?: string;
  isMe?: boolean;
  children?: React.ReactNode;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  text,
  time,
  senderName,
  avatar,
  isMe = false,
  children,
}) => {
  const content = children ?? text ?? message?.mes ?? '';
  const displayTime = time ?? message?.createAt ?? '';
  const displayName = senderName ?? message?.name ?? '';

  if (isMe) {
    return (
      <div className="message-row me">
        <div className="message-content-group me">
          <div className="message-bubble me">{content}</div>

          {displayTime && (
            <span className="message-time me">{displayTime}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="message-row other">
      {avatar ? (
        <img
          src={avatar}
          alt={displayName || 'Avatar'}
          className="message-sender-avatar"
        />
      ) : (
        <div className="message-sender-avatar-placeholder">
          <FaUser />
        </div>
      )}

      <div className="message-content-group other">
        {displayName && (
          <span className="message-sender-name">{displayName}</span>
        )}

        <div className="message-bubble other">{content}</div>

        {displayTime && (
          <span className="message-time other">{displayTime}</span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

