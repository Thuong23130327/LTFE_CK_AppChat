import React, { useEffect, useLayoutEffect, useRef } from 'react';
import type { ChatMessageType } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { BiLoaderAlt } from 'react-icons/bi';

interface MessageListProps {
  messages: ChatMessageType[];
  currentUsername?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
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
  onLoadMore,
  hasMore = true,
  isLoadingMore = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const isPrependingRef = useRef<boolean>(false);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoadRef.current = true;
    }
  }, [messages.length]);

  useEffect(() => {
    if (!isLoadingMore) {
      isPrependingRef.current = false;
    }
  }, [isLoadingMore]);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isPrependingRef.current) {
      const newScrollHeight = container.scrollHeight;
      const delta = newScrollHeight - prevScrollHeightRef.current;

      container.scrollTop = prevScrollTopRef.current + delta;
      isPrependingRef.current = false;
    } else if (isInitialLoadRef.current) {
      // hiển thị tn ngay khi mở cuộc hội thoại
      scrollToBottom('auto');

      const t1 = setTimeout(() => {
        scrollToBottom('auto');
        isInitialLoadRef.current = false;
      }, 50);

      const t2 = setTimeout(() => {
        scrollToBottom('auto');
      }, 150);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      scrollToBottom('smooth');
    }
  }, [messages]);
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (isInitialLoadRef.current) return;

    if (container.scrollTop <= 10 && hasMore && !isLoadingMore && onLoadMore) {
      prevScrollHeightRef.current = container.scrollHeight;
      prevScrollTopRef.current = container.scrollTop;
      isPrependingRef.current = true;
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      className="message-list-container"
      onScroll={handleScroll}
    >
      {/* hiệu ứng khi tải tn cũ */}
      {isLoadingMore && (
        <div className="loading-older-messages">
          <BiLoaderAlt className="loading-spinner" />
          <span>Đang tải thêm tin nhắn cũ...</span>
        </div>
      )}

      {/* tb khi cuộn tới đầu */}
      {!hasMore && messages.length >= 50 && (
        <div className="no-more-messages">
          <span>Đã hiển thị toàn bộ lịch sử trò chuyện</span>
        </div>
      )}

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
