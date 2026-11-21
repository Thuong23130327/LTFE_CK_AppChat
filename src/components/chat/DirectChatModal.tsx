import React, { useEffect, useRef, useState } from 'react';
import { IoClose, IoPersonAddOutline } from 'react-icons/io5';
import { ws } from '../../services/websocket';
import { WS_EVENTS, type ConversationItemType, type WsResponse } from '../../types/chat';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { setActiveConversation, upsertConversation } from '../../store/slices/chatSlice';
import './Modal.css';

interface DirectChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const currentUsername = useAppSelector((state) => state.auth.username);

    const [targetUser, setTargetUser] = useState('');
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // lưu tên user đang chờ server phản hồi
    const pendingUserRef = useRef<string>('');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    // reset state mỗi khi đóng mở modal
    useEffect(() => {
        if (isOpen) {
            setTargetUser('');
            setError('');
            setIsSearching(false);
            pendingUserRef.current = '';
            clearTimer();
        } else {
            clearTimer();
        }
        return () => clearTimer();
    }, [isOpen]);

    // lắng nghe phản hồi CHECK_USER_EXIST từ WebSocket
    useEffect(() => {
        if (!isOpen) return;

        const handleWsMessage = (res: WsResponse) => {
            if (res.event !== WS_EVENTS.CHECK_USER_EXIST) return;

            const searchedUser = pendingUserRef.current;
            if (!searchedUser) return;

            clearTimer();
            setIsSearching(false);
            pendingUserRef.current = '';

            const isExist =
                res.status === 'success' && Boolean(res.data?.status ?? res.data === true);

            if (isExist) {
                const now = new Date();
                const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
                    now.getMinutes()
                ).padStart(2, '0')}`;

                const newConversation: ConversationItemType = {
                    id: `0-${searchedUser}`,
                    name: searchedUser,
                    type: 0,
                    actionTime: formattedTime,
                };

                dispatch(upsertConversation(newConversation));
                dispatch(setActiveConversation(newConversation));

                // kiểm tra trạng thái onl của user vừa tìm thấy
                ws.send(WS_EVENTS.CHECK_USER_ONLINE, { user: searchedUser });

                onClose();
            } else {
                setError('Người dùng không tồn tại');
            }
        };

        ws.addMessageListener(handleWsMessage);
        return () => {
            ws.removeMessageListener(handleWsMessage);
            clearTimer();
        };
    }, [isOpen, dispatch, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = targetUser.trim();

        if (!trimmed) {
            setError('Vui lòng nhập tên tài khoản muốn chat');
            return;
        }

        if (currentUsername && trimmed.toLowerCase() === currentUsername.toLowerCase()) {
            setError('Bạn không thể tự nhắn tin với chính mình');
            return;
        }

        setError('');
        setIsSearching(true);
        pendingUserRef.current = trimmed;
        clearTimer();
        timerRef.current = setTimeout(() => {
            if (pendingUserRef.current) {
                setIsSearching(false);
                pendingUserRef.current = '';
                setError('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.');
            }
        }, 7000);
        ws.send(WS_EVENTS.CHECK_USER_EXIST, { user: trimmed });
    };

    return (
        <div className="chat-modal-backdrop" onClick={onClose}>
            <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="chat-modal-header">
                    <h3 className="chat-modal-title">
                        <IoPersonAddOutline />
                        <span>Bắt đầu cuộc trò chuyện 1-1</span>
                    </h3>
                    <button
                        type="button"
                        className="chat-modal-close-btn"
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <IoClose />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="chat-modal-body">
                        <label htmlFor="direct-chat-username" className="chat-modal-label">
                            Tên tài khoản người nhận
                        </label>
                        <input
                            id="direct-chat-username"
                            type="text"
                            className="chat-modal-input"
                            placeholder="Nhập username (ví dụ: ti, long...)"
                            value={targetUser}
                            onChange={(e) => {
                                setTargetUser(e.target.value);
                                if (error) setError('');
                            }}
                            autoFocus
                            disabled={isSearching}
                        />

                        {error && <div className="chat-modal-error">{error}</div>}
                    </div>

                    <div className="chat-modal-footer">
                        <button
                            type="button"
                            className="chat-modal-btn chat-modal-btn-secondary"
                            onClick={onClose}
                            disabled={isSearching}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="chat-modal-btn chat-modal-btn-primary"
                            disabled={isSearching || !targetUser.trim()}
                        >
                            {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};