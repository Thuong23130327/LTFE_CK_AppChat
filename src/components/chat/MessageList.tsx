import React, { useEffect, useRef } from 'react';
import type { ChatMessageType } from '../../types/chat';
import { MessageItem } from './MessageItem';

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
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list-container">
      {messages.map((msg) => {
        const avatarUrl =
          AVATAR_MAP[msg.name] ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=random`;

        return (
          <MessageItem
            key={msg.id}
            message={msg}
            avatar={avatarUrl}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};
