import React, { useEffect, useRef, useState } from 'react';
import { IoClose, IoAddCircleOutline } from 'react-icons/io5';
import { ws } from '../../services/websocket';
import { WS_EVENTS, type ConversationItemType, type WsResponse } from '../../types/chat';
import { useAppDispatch } from '../../hooks/useAppRedux';
import { setActiveConversation, upsertConversation } from '../../store/slices/chatSlice';
import './Modal.css';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();

    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const pendingRoomRef = useRef<string>('');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        if (isOpen) {
            setRoomName('');
            setError('');
            setIsCreating(false);
            pendingRoomRef.current = '';
            clearTimer();
        } else {
            clearTimer();
        }
        return () => clearTimer();
    }, [isOpen]);

    // Lắng nghe phản hồi CREATE_ROOM từ WebSocket
    useEffect(() => {
        if (!isOpen) return;

        const handleWsMessage = (res: WsResponse) => {
            if (res.event !== WS_EVENTS.CREATE_ROOM) return;

            const requestedRoom = pendingRoomRef.current;
            if (!requestedRoom) return;

            clearTimer();
            setIsCreating(false);
            pendingRoomRef.current = '';

            if (res.status === 'success') {
                const createdRoomName: string = res.data?.name || requestedRoom;
                const now = new Date();
                const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
                    now.getMinutes()
                ).padStart(2, '0')}`;

                const newRoomConversation: ConversationItemType = {
                    id: `1-${createdRoomName}`,
                    name: createdRoomName,
                    type: 1,
                    actionTime: formattedTime,
                    unreadCount: 0,
                };

                dispatch(upsertConversation(newRoomConversation));
                dispatch(setActiveConversation(newRoomConversation));

                // Đồng bộ lại danh sách hội thoại từ server
                ws.send(WS_EVENTS.GET_USER_LIST);

                onClose();
            } else {
                const errMsg =
                    res.mes === 'Room Exist or Error'
                        ? 'Tên phòng đã tồn tại hoặc không hợp lệ'
                        : res.mes || 'Không thể tạo phòng chat';
                setError(errMsg);
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
        const trimmed = roomName.trim();

        if (!trimmed) {
            setError('Vui lòng nhập tên phòng muốn tạo');
            return;
        }

        setError('');
        setIsCreating(true);
        pendingRoomRef.current = trimmed;
        clearTimer();
        timerRef.current = setTimeout(() => {
            if (pendingRoomRef.current) {
                setIsCreating(false);
                pendingRoomRef.current = '';
                setError('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.');
            }
        }, 7000);
        ws.send(WS_EVENTS.CREATE_ROOM, { name: trimmed });
    };

    return (
        <div className="chat-modal-backdrop" onClick={onClose}>
            <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="chat-modal-header">
                    <h3 className="chat-modal-title">
                        <IoAddCircleOutline />
                        <span>Tạo phòng chat mới</span>
                    </h3>
                    <button
                        type="button"
                        className="chat-modal-close-btn"
                        onClick={onClose}
                        aria-label="Đóng"
                        disabled={isCreating}
                    >
                        <IoClose />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="chat-modal-body">
                        <label htmlFor="create-room-name" className="chat-modal-label">
                            Tên phòng mới
                        </label>
                        <input
                            id="create-room-name"
                            type="text"
                            className="chat-modal-input"
                            placeholder="Nhập tên phòng cần tạo (ví dụ: NhomHocTap...)"
                            value={roomName}
                            onChange={(e) => {
                                setRoomName(e.target.value);
                                if (error) setError('');
                            }}
                            autoFocus
                            disabled={isCreating}
                        />

                        {error && <div className="chat-modal-error">{error}</div>}
                    </div>

                    <div className="chat-modal-footer">
                        <button
                            type="button"
                            className="chat-modal-btn chat-modal-btn-secondary"
                            onClick={onClose}
                            disabled={isCreating}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="chat-modal-btn chat-modal-btn-primary"
                            disabled={isCreating || !roomName.trim()}
                        >
                            {isCreating ? 'Đang tạo...' : 'Tạo phòng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
