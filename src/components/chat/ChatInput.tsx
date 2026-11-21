import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { BsEmojiSmile, BsImage } from 'react-icons/bs';
import { ws } from '../../services/websocket';
import { useAppSelector } from '../../hooks/useAppRedux';
import type { ConversationItemType } from '../../types/chat';

interface ChatInputProps {
  activeConversation?: ConversationItemType | null;
  onSendMessage?: (messageText: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  activeConversation: propActiveConversation,
  onSendMessage,
  disabled = false,
}) => {
  const [text, setText] = useState<string>('');

  const reduxActiveConversation = useAppSelector(
    (state) => state.chat.activeConversation
  );
  const activeConversation = propActiveConversation ?? reduxActiveConversation;

  // gửi tn
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || !activeConversation) return;

    ws.send("SEND_CHAT", {
      type: activeConversation.type === 1 ? "room" : "people",
      to: activeConversation.name,
      mes: trimmed,
    });

    if (onSendMessage) {
      onSendMessage(trimmed);
    }

    // clear sau khi gửi
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <button
        type="button"
        className="chat-input-tool-btn"
        title="Gửi hình ảnh"
        aria-label="Gửi hình ảnh"
      >
        <BsImage />
      </button>

      {/* Nút Emoji */}
      <button
        type="button"
        className="chat-input-tool-btn"
        title="Chọn biểu tượng cảm xúc (để sau)"
        aria-label="Biểu tượng cảm xúc (để sau)"
      >
        <BsEmojiSmile />
      </button>

      {/* messageInput */}
      <div className="chat-input-field-wrapper">
        <input
          type="text"
          className="chat-input-control"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || !activeConversation}
        />
      </div>

      {/* Nút Gửi */}
      <button
        type="submit"
        className="chat-send-btn"
        disabled={disabled || !activeConversation || !text.trim()}
        title="Gửi tin nhắn"
        aria-label="Gửi tin nhắn"
      >
        <IoSend />
      </button>
    </form>
  );
};
