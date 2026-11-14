import React, { useEffect, useState } from 'react';
import './Chat.css';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatPlaceholder } from './ChatPlaceholder';
import {
  mockMessages,
  mockMessagesByConversationId,
  mockThuongMessages,
  mockYenMessages,
} from '../../data/mockMessages';
import type { ChatMessageType, ConversationItemType } from '../../types/chat';
import { useAppSelector } from '../../hooks/useAppRedux';

interface ChatAreaProps {
  activeConversation?: ConversationItemType | null;
  currentUsername?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeConversation: propConversation,
  currentUsername = 'Tấn Phát',
}) => {
  const reduxActiveConversation = useAppSelector((state) => state.chat.activeConversation);
  const activeConversation = propConversation !== undefined ? propConversation : reduxActiveConversation;

  const authUsername = useAppSelector((state) => state.auth.username);
  const activeUser = authUsername || currentUsername;

  const getConversationMessages = (conv: ConversationItemType, user: string): ChatMessageType[] => {
    let list: ChatMessageType[] = [];
    if (conv.id && mockMessagesByConversationId[conv.id]) {
      list = mockMessagesByConversationId[conv.id];
    } else if (conv.name === 'Nhóm Đồ Án LTFE') {
      list = mockMessages;
    } else if (conv.name === 'Nguyễn Hoài Thương') {
      list = mockThuongMessages;
    } else if (conv.name === 'Tiểu Yến') {
      list = mockYenMessages;
    } else {
      list = [
        {
          id: Date.now(),
          name: conv.name,
          to: user,
          mes: `Chào bạn! Đây là cuộc hội thoại mới với ${conv.name}.`,
          createAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          type: conv.type,
        },
      ];
    }

    return list.map((msg) =>
      msg.name === 'Tấn Phát' && user !== 'Tấn Phát' ? { ...msg, name: user } : msg
    );
  };

  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    return activeConversation ? getConversationMessages(activeConversation, activeUser) : [];
  });

  useEffect(() => {
    if (activeConversation) {
      setMessages(getConversationMessages(activeConversation, activeUser));
    }
  }, [activeConversation?.name, activeConversation?.id, activeUser]);

  if (!activeConversation) {
    return <ChatPlaceholder />;
  }

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessageType = {
      id: Date.now(),
      name: activeUser,
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
      <MessageList messages={messages} currentUsername={activeUser} />

      {/* ChatInput */}
      <ChatInput onSendMessage={handleSendMessage} />
    </section>
  );
};
