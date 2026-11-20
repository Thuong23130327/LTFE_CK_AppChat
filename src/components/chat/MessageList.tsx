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
  currentUsername = 'Tiểu Yến',
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom('smooth');
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="message-list-container">
      {messages.map((msg, index) => {
        const avatarUrl =
          AVATAR_MAP[msg.name] ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=random`;

        const isMe = currentUsername ? msg.name === currentUsername : false;

        return (
          <MessageBubble
            key={msg.id ?? `${msg.name}-${msg.createAt}-${index}`}
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
