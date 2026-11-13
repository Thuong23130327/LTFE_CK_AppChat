import React from 'react';
import { FaUser, FaUsers } from 'react-icons/fa';
import {
  IoCallOutline,
  IoVideocamOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';

interface ChatHeaderProps {
  name: string;
  type?: 0 | 1; // 0: Chat cá nhân, 1: Chat nhóm
  avatar?: string;
  isOnline?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  type = 0,
  avatar,
  isOnline = false,
}) => {
  return (
    <header className="chat-header-bar">
      <div className="chat-header-left">
        <div className="chat-header-avatar-wrapper">
          {avatar ? (
            <img src={avatar} alt={name} className="chat-header-avatar" />
          ) : (
            <div className="chat-header-avatar-fallback">
              {type === 1 ? <FaUsers /> : <FaUser />}
            </div>
          )}
          {/* Chấm trạng thái trên avatar */}
          <span
            className={`chat-header-status-dot ${isOnline ? 'online' : ''}`}
            title={isOnline ? 'Đang hoạt động' : 'Offline'}
          />
        </div>

        <div className="chat-header-info">
          <div className="chat-header-name">
            <span className="chat-header-type-icon">
              {type === 1 ? <FaUsers /> : <FaUser />}
            </span>
            <span>{name}</span>
          </div>

          {/* Hiển thị trạng thái ("Đang hoạt động" hoặc "Offline") */}
          <div className={`chat-header-status ${isOnline ? 'online' : ''}`}>
            {isOnline ? 'Đang hoạt động' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="chat-header-actions">
        <button
          type="button"
          className="chat-header-btn"
          title="Gọi thoại"
          aria-label="Gọi thoại"
        >
          <IoCallOutline />
        </button>
        <button
          type="button"
          className="chat-header-btn"
          title="Gọi video"
          aria-label="Gọi video"
        >
          <IoVideocamOutline />
        </button>
        <button
          type="button"
          className="chat-header-btn"
          title="Thông tin cuộc trò chuyện"
          aria-label="Thông tin cuộc trò chuyện"
        >
          <IoInformationCircleOutline />
        </button>
      </div>
    </header>
  );
};

