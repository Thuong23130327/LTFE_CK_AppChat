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

// xử lý thời gian theo múi giờ VN
export const formatDisplayTime = (rawTime?: string): string => {
  if (!rawTime) return '';
  const str = String(rawTime).trim();
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    return str;
  }
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    return str.slice(0, 5);
  }

  let isoStr = str;
  if (str.includes(' ') && !str.includes('T')) {
    isoStr = str.replace(' ', 'T');
  }

  const dmyMatch = isoStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})T(.*)$/);
  if (dmyMatch) {
    isoStr = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}T${dmyMatch[4]}`;
  }

  if (!isoStr.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(isoStr)) {
    isoStr += 'Z';
  }

  const d = new Date(isoStr);
  if (!isNaN(d.getTime())) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  if (str.includes(' ')) {
    const parts = str.split(' ');
    if (parts[1]) return parts[1].slice(0, 5);
  }

  return str.length > 5 ? str.slice(0, 5) : str;
};

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
  const rawTime = time ?? message?.createAt ?? '';
  const displayTime = formatDisplayTime(rawTime);
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

