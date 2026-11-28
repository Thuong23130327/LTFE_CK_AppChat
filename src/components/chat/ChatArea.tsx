import React, { useEffect, useRef, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { setRoomToLeave, upsertConversation } from '../../store/slices/chatSlice';

interface ChatAreaProps {
  activeConversation?: ConversationItemType | null;
  currentUsername?: string;
}

const parseMsgTimestamp = (createAt?: string, id?: any): number => {
  if (createAt) {
    const str = String(createAt).trim();
    if (str.includes(' ') || str.includes('T')) {
      let iso = str.replace(' ', 'T');
      const dmy = iso.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})T(.*)$/);
      if (dmy) {
        iso = `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}T${dmy[4]}`;
      }
      const t = new Date(iso).getTime();
      if (!isNaN(t)) return t;
    }
    const hm = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (hm) {
      return (
        parseInt(hm[1], 10) * 3600 +
        parseInt(hm[2], 10) * 60 +
        (hm[3] ? parseInt(hm[3], 10) : 0)
      );
    }
  }
  if (typeof id === 'number') {
    return id;
  }
  return 0;
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeConversation: propConversation,
  currentUsername = 'Tiểu Yến',
}) => {
  const dispatch = useAppDispatch();
  const reduxActiveConversation = useAppSelector((state) => state.chat.activeConversation);
  const activeConversation = propConversation !== undefined ? propConversation : reduxActiveConversation;

  const authUsername = useAppSelector((state) => state.auth.username);
  const activeUser = authUsername || currentUsername;

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const pageRef = useRef<number>(1);
  pageRef.current = page;
  const hasMoreRef = useRef<boolean>(true);
  hasMoreRef.current = hasMore;
  const isLoadingMoreRef = useRef<boolean>(false);
  isLoadingMoreRef.current = isLoadingMore;

  const pendingOptimisticIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    pendingOptimisticIdsRef.current.clear();
    if (!activeConversation) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      setIsLoadingMore(false);
      return;
    }

    setMessages([]);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);

    if (activeConversation.type === 1) {
      ws.send(WS_EVENTS.GET_ROOM_CHAT_MES, {
        name: activeConversation.name,
        page: 1,
      });
    } else {
      ws.send(WS_EVENTS.GET_PEOPLE_CHAT_MES, {
        name: activeConversation.name,
        page: 1,
      });
    }
  }, [activeConversation?.name, activeConversation?.type]);

  const handleLoadMore = () => {
    if (!activeConversation || !hasMoreRef.current || isLoadingMoreRef.current) {
      return;
    }

    const nextPage = pageRef.current + 1;
    setIsLoadingMore(true);
    setPage(nextPage);

    if (activeConversation.type === 1) {
      ws.send(WS_EVENTS.GET_ROOM_CHAT_MES, {
        name: activeConversation.name,
        page: nextPage,
      });
    } else {
      ws.send(WS_EVENTS.GET_PEOPLE_CHAT_MES, {
        name: activeConversation.name,
        page: nextPage,
      });
    }
  };

  useEffect(() => {
    const handleWsMessage = (res: WsResponse) => {
      if (!activeConversation) return;

      if (
        res.event === WS_EVENTS.GET_ROOM_CHAT_MES ||
        res.event === WS_EVENTS.GET_PEOPLE_CHAT_MES
      ) {
        if (res.status === 'error') {
          setIsLoadingMore(false);
          setHasMore(false);
          return;
        }

        if (res.status === 'success') {
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

          const currentPage = pageRef.current;
          setIsLoadingMore(false);

          if (rawList.length === 0) {
            setHasMore(false);
            return;
          }

          if (rawList.length < 50) {
            setHasMore(false);
          }

          let list: ChatMessageType[] = rawList.map((item: any, idx: number) => ({
            id: item.id ?? (currentPage > 1 ? `old-${currentPage}-${idx}` : idx),
            name: item.name || item.user || '',
            to: item.to || activeConversation.name,
            mes: item.mes || item.message || '',
            createAt: item.createAt || item.time || '',
            type: activeConversation.type,
          }));

          if (list.length > 1) {
            const tFirst = parseMsgTimestamp(list[0].createAt, list[0].id);
            const tLast = parseMsgTimestamp(list[list.length - 1].createAt, list[list.length - 1].id);
            if (tFirst > tLast) {
              list = list.reverse();
            }
          }

          if (currentPage === 1) {
            // trang 1
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
          } else {
            // trang>1
            setMessages((prev) => {
              const existingKeys = new Set<string>();
              for (const m of prev) {
                const key = m.id != null ? `id-${m.id}` : `${m.name}-${m.createAt}-${m.mes}`;
                existingKeys.add(key);
              }

              const olderUnique: ChatMessageType[] = [];
              for (const item of list) {
                const key = item.id != null ? `id-${item.id}` : `${item.name}-${item.createAt}-${item.mes}`;
                if (!existingKeys.has(key)) {
                  existingKeys.add(key);
                  olderUnique.push(item);
                }
              }

              if (olderUnique.length === 0) {
                setHasMore(false);
                return prev;
              }

              return [...olderUnique, ...prev];
            });
          }
        }
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

          //chống trùng lặp tn
          setMessages((prev) => {
            const sameIdIndex = newMsg.id != null
              ? prev.findIndex((m) => m.id != null && m.id === newMsg.id)
              : -1;
            if (sameIdIndex !== -1) {
              return prev;
            }


            if (sender === activeUser) {
              const optimisticIndex = prev.findIndex(
                (m) =>
                  m.id != null &&
                  pendingOptimisticIdsRef.current.has(m.id) &&
                  m.mes === newMsg.mes
              );
              if (optimisticIndex !== -1) {
                const tempId = prev[optimisticIndex].id!;
                pendingOptimisticIdsRef.current.delete(tempId);
                const updated = [...prev];
                updated[optimisticIndex] = {
                  ...updated[optimisticIndex],
                  id: newMsg.id ?? tempId,
                  createAt: newMsg.createAt || updated[optimisticIndex].createAt,
                };
                return updated;
              }
            }

            const isDuplicateExact = prev.some(
              (m) =>
                m.name === newMsg.name &&
                m.mes === newMsg.mes &&
                Boolean(m.createAt) &&
                m.createAt === newMsg.createAt
            );
            if (isDuplicateExact) return prev;

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

    const tempId = Date.now();
    pendingOptimisticIdsRef.current.add(tempId);

    const newMessage: ChatMessageType = {
      id: tempId,
      name: activeUser,
      to: activeConversation.name,
      mes: text,
      createAt: formattedLocalTime,
      type: activeConversation.type,
    };

    setMessages((prev) => [...prev, newMessage]);

    dispatch(
      upsertConversation({
        name: activeConversation.name,
        type: activeConversation.type,
        lastMessage: text,
        actionTime: formattedLocalTime,
        avatar: activeConversation.avatar,
        isOnline: activeConversation.isOnline,
      })
    );
  };

  return (
    <section className="chat-area">
      {/* ChatHeader */}
      <ChatHeader
        name={activeConversation.name}
        type={activeConversation.type}
        avatar={activeConversation.avatar}
        isOnline={activeConversation.isOnline}
        onLeaveRoom={() => dispatch(setRoomToLeave(activeConversation.name))}
      />

      {/* MessageList */}
      <MessageList
        key={`${activeConversation.type}-${activeConversation.name}`}
        messages={messages}
        currentUsername={activeUser}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />

      {/* ChatInput */}
      <ChatInput
        activeConversation={activeConversation}
        onSendMessage={handleSendMessage}
      />
    </section>
  );
};
