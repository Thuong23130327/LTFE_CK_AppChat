import React from 'react';
import { BsChatDots } from 'react-icons/bs';
import './ChatPlaceholder.css';

export const ChatPlaceholder: React.FC = () => {
  return (
    <div className="chat-placeholder-container">
      <div className="chat-placeholder-card">
        <div className="chat-placeholder-icon-wrapper">
          <BsChatDots className="chat-placeholder-icon" />
        </div>
        <h3 className="chat-placeholder-title">Chưa chọn cuộc trò chuyện</h3>
        <p className="chat-placeholder-text">
          Hãy chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu nhắn tin
        </p>
      </div>
    </div>
  );
};

export default ChatPlaceholder;

