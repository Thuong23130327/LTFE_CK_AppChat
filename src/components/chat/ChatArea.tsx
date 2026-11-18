import React, { useEffect, useState } from 'react';
import './Chat.css';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatPlaceholder } from './ChatPlaceholder';
import { ws } from '../../services/websocket';
import {
  WS_EVENTS,
  type ChatMessageType,
  type ConversationItemType,
  type WsResponse,
} from '../../types/chat';
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

  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  // tải tn từ websoket server
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    // reset trc khi tải tn mới
    setMessages([]);

    // nhóm chat
    if (activeConversation.type === 1) {
      ws.send(WS_EVENTS.GET_ROOM_CHAT_MES, {
        name: activeConversation.name,
        page: 1,
      });
    } else {
      // chat 1-1
      ws.send(WS_EVENTS.GET_PEOPLE_CHAT_MES, {
        name: activeConversation.name,
        page: 1,
      });
    }
  }, [activeConversation?.name, activeConversation?.type]);

  // hiện thị tn
  useEffect(() => {
    const handleWsMessage = (res: WsResponse) => {
      if (!activeConversation) return;
      if (
        (res.event === WS_EVENTS.GET_ROOM_CHAT_MES ||
          res.event === WS_EVENTS.GET_PEOPLE_CHAT_MES) &&
        res.status === 'success'
      ) {
        console.log(`[WS] ${res.event} response:`, res);
        let rawList: any[] = [];
        if (Array.isArray(res.data)) {
          rawList = res.data;
        } else if (res.data && Array.isArray(res.data.chatData)) {
          rawList = res.data.chatData;
        } else if (res.data && Array.isArray(res.data.messages)) {
          rawList = res.data.messages;
        } else if (res.data && Array.isArray(res.data.data)) {
          rawList = res.data.data;
        }

        let list: ChatMessageType[] = rawList.map((item: any, idx: number) => ({
          id: item.id ?? idx,
          name: item.name || item.user || '',
          to: item.to || activeConversation.name,
          mes: item.mes || item.message || '',
          createAt: item.createAt || item.time || '',
          type: activeConversation.type,
        }));

        if (list.length > 1) {
          const firstTime = list[0].createAt || '';
          const lastTime = list[list.length - 1].createAt || '';
          if (firstTime > lastTime) {
            list = list.reverse();
          }
        }

        setMessages(list);
      }

      if (res.event === WS_EVENTS.SEND_CHAT && res.status === 'success' && res.data) {
        const incoming = res.data;

        const isMatchRoom =
          activeConversation.type === 1 && incoming.to === activeConversation.name;
        const isMatchPeople =
          activeConversation.type === 0 &&
          ((incoming.name === activeConversation.name && incoming.to === activeUser) ||
            (incoming.name === activeUser && incoming.to === activeConversation.name));

        if (isMatchRoom || isMatchPeople) {
          const newMsg: ChatMessageType = {
            id: incoming.id ?? Date.now(),
            name: incoming.name || incoming.user || '',
            to: incoming.to || activeConversation.name,
            mes: incoming.mes || incoming.message || '',
            createAt:
              incoming.createAt ||
              incoming.time ||
              new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            type: activeConversation.type,
          };

          setMessages((prev) => {
            if (newMsg.id && prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      }
    };

    ws.addMessageListener(handleWsMessage);
    return () => {
      ws.removeMessageListener(handleWsMessage);
    };
  }, [activeConversation, activeUser]);

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
