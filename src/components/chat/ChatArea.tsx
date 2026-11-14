import React, { useState } from 'react';
import './Chat.css';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { mockMessages } from '../../data/mockMessages';
import type { ChatMessageType, ConversationItemType } from '../../types/chat';

interface ChatAreaProps {
  activeConversation?: ConversationItemType;
  currentUsername?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeConversation = {
    id: '1',
    name: 'Nhóm Đồ Án LTFE',
    type: 1,
    avatar: 'https://i.pravatar.cc/150?u=1',
    lastMessage: 'Push code lên đi Phát ơi',
    actionTime: '18:05',
    isOnline: true,
  },
  currentUsername = 'Tấn Phát',
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>(mockMessages);

  // xử lý gửi tin nhắn mới
  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessageType = {
      id: Date.now(),
      name: currentUsername,
      to: activeConversation.name,
      mes: text,
      createAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: activeConversation.type,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <section className="chat-area">
      {/* ChatHeader */}
      <ChatHeader
        name={activeConversation.name}
        type={activeConversation.type}
        avatar={activeConversation.avatar}
        isOnline={activeConversation.isOnline}
      />

      {/* MessageList */}
      <MessageList messages={messages} />

      {/* ChatInput */}
      <ChatInput onSendMessage={handleSendMessage} />
    </section>
  );
};
