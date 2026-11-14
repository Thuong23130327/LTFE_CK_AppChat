import React, { useEffect, useRef } from 'react';
import type { ChatMessageType } from '../../types/chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessageType[];
  currentUsername?: string;
}

const AVATAR_MAP: Record<string, string> = {
  'Nguyễn Hoài Thương': 'https://i.pravatar.cc/150?u=2',
  'Tiểu Yến': 'https://i.pravatar.cc/150?u=3',
  'Tấn Phát': 'https://i.pravatar.cc/150?u=phat',
  'abc': 'https://i.pravatar.cc/150?u=4',
};

export const MessageList: React.FC<MessageListProps> = ({
  messages = [],
  currentUsername = 'Tấn Phát',
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasMyMessages = messages.some((m) => m.name === currentUsername);

  return (
    <div className="message-list-container">
      {messages.map((msg) => {
        const avatarUrl =
          AVATAR_MAP[msg.name] ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=random`;

        const isMe = Boolean(
          currentUsername &&
          (msg.name === currentUsername ||
            (!hasMyMessages && msg.name === 'Tấn Phát'))
        );

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            avatar={avatarUrl}
            isMe={isMe}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};
