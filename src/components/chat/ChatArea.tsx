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
  currentUsername = 'Tiểu Yến',
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

        // lọc tn trùng
        const uniqueList: ChatMessageType[] = [];
        const seenKeys = new Set<string>();
        for (const item of list) {
          const key = item.id != null ? `id-${item.id}` : `${item.name}-${item.createAt}-${item.mes}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueList.push(item);
          }
        }

        setMessages(uniqueList);
      }

      if (res.event === WS_EVENTS.SEND_CHAT && res.status === 'success' && res.data) {
        const incoming = res.data;

        const targetRoom = incoming.to || incoming.room || incoming.roomName;
        const sender = incoming.name || incoming.user || incoming.from || '';
        const receiver = incoming.to || '';

        const isMatchRoom =
          activeConversation.type === 1 && targetRoom === activeConversation.name;
        const isMatchPeople =
          activeConversation.type === 0 &&
          ((sender === activeConversation.name && receiver === activeUser) ||
            (sender === activeUser && receiver === activeConversation.name));

        if (isMatchRoom || isMatchPeople) {
          const newMsg: ChatMessageType = {
            id: incoming.id,
            name: sender,
            to: receiver || activeConversation.name,
            mes: incoming.mes || incoming.message || '',
            createAt:
              incoming.createAt ||
              incoming.time ||
              new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            type: activeConversation.type,
          };

          //chống lặp tn khi nhận
          setMessages((prev) => {
            const isDuplicate = prev.some((m) => {
              if (newMsg.id != null && m.id != null && m.id === newMsg.id) {
                return true;
              }

              if (m.name === newMsg.name && m.mes === newMsg.mes) {
                if (m.createAt && newMsg.createAt) {
                  const mTime = m.createAt.slice(-5);
                  const newTime = newMsg.createAt.slice(-5);
                  if (m.createAt === newMsg.createAt || mTime === newTime) {
                    return true;
                  }
                }
                if (m.name === activeUser) {
                  return true;
                }
              }

              return false;
            });

            if (isDuplicate) {
              let updatedPending = false;
              return prev.map((m) => {
                if (newMsg.id != null && m.id === newMsg.id) {
                  return m;
                }
                if (!updatedPending && m.name === newMsg.name && m.mes === newMsg.mes) {
                  updatedPending = true;
                  return {
                    ...m,
                    id: newMsg.id ?? m.id,
                    createAt: newMsg.createAt || m.createAt,
                  };
                }
                return m;
              });
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
    const now = new Date();
    const formattedLocalTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newMessage: ChatMessageType = {
      id: Date.now(),
      name: activeUser,
      to: activeConversation.name,
      mes: text,
      createAt: formattedLocalTime,
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
      <ChatInput
        activeConversation={activeConversation}
        onSendMessage={handleSendMessage}
      />
    </section>
  );
};
