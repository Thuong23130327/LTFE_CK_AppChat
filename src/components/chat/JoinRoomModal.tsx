import React, { useEffect, useRef, useState } from 'react';
import { IoClose, IoEnterOutline } from 'react-icons/io5';
import { ws } from '../../services/websocket';
import { WS_EVENTS, type ConversationItemType, type WsResponse } from '../../types/chat';
import { useAppDispatch } from '../../hooks/useAppRedux';
import { setActiveConversation, upsertConversation } from '../../store/slices/chatSlice';
import './Modal.css';

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();

    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState('');
    const [isJoining, setIsJoining] = useState(false);

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
            setIsJoining(false);
            pendingRoomRef.current = '';
            clearTimer();
        } else {
            clearTimer();
        }
        return () => clearTimer();
    }, [isOpen]);

    // lắng nghe phản hồi JOIN_ROOM từ WebSocket
    useEffect(() => {
        if (!isOpen) return;

        const handleWsMessage = (res: WsResponse) => {
            if (res.event !== WS_EVENTS.JOIN_ROOM) return;

            const requestedRoom = pendingRoomRef.current;
            if (!requestedRoom) return;

            clearTimer();
            setIsJoining(false);
            pendingRoomRef.current = '';

            if (res.status === 'success') {
                const joinedRoomName: string = res.data?.name || requestedRoom;
                const now = new Date();
                const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
                    now.getMinutes()
                ).padStart(2, '0')}`;

                const newRoomConversation: ConversationItemType = {
                    id: `1-${joinedRoomName}`,
                    name: joinedRoomName,
                    type: 1,
                    actionTime: formattedTime,
                };

                dispatch(upsertConversation(newRoomConversation));
                dispatch(setActiveConversation(newRoomConversation));

                // đồng bộ lại danh sách hội thoại từ server
                ws.send(WS_EVENTS.GET_USER_LIST);

                onClose();
            } else {
                const errMsg =
                    res.mes === 'Room not found'
                        ? 'Phòng không tồn tại'
                        : res.mes || 'Không thể tham gia phòng';
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
            setError('Vui lòng nhập tên phòng muốn tham gia');
            return;
        }

        setError('');
        setIsJoining(true);
        pendingRoomRef.current = trimmed;
        clearTimer();
        timerRef.current = setTimeout(() => {
            if (pendingRoomRef.current) {
                setIsJoining(false);
                pendingRoomRef.current = '';
                setError('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.');
            }
        }, 7000);
        ws.send(WS_EVENTS.JOIN_ROOM, { name: trimmed });
    };

    return (
        <div className="chat-modal-backdrop" onClick={onClose}>
            <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="chat-modal-header">
                    <h3 className="chat-modal-title">
                        <IoEnterOutline />
                        <span>Tham gia phòng chat</span>
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
                        <label htmlFor="join-room-name" className="chat-modal-label">
                            Tên phòng có sẵn
                        </label>
                        <input
                            id="join-room-name"
                            type="text"
                            className="chat-modal-input"
                            placeholder="Nhập tên phòng (ví dụ: ABC...)"
                            value={roomName}
                            onChange={(e) => {
                                setRoomName(e.target.value);
                                if (error) setError('');
                            }}
                            autoFocus
                            disabled={isJoining}
                        />

                        {error && <div className="chat-modal-error">{error}</div>}
                    </div>

                    <div className="chat-modal-footer">
                        <button
                            type="button"
                            className="chat-modal-btn chat-modal-btn-secondary"
                            onClick={onClose}
                            disabled={isJoining}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="chat-modal-btn chat-modal-btn-primary"
                            disabled={isJoining || !roomName.trim()}
                        >
                            {isJoining ? 'Đang tham gia...' : 'Tham gia'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};