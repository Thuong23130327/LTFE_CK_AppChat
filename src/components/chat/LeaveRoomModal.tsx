import React from 'react';
import { IoClose, IoExitOutline } from 'react-icons/io5';
import './Modal.css';

interface LeaveRoomModalProps {
    isOpen: boolean;
    roomName: string;
    onClose: () => void;
    onConfirm: (roomName: string) => void;
    isLoading?: boolean;
}

export const LeaveRoomModal: React.FC<LeaveRoomModalProps> = ({
    isOpen,
    roomName,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="chat-modal-backdrop" onClick={onClose}>
            <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="chat-modal-header">
                    <h3 className="chat-modal-title" style={{ color: '#dc2626' }}>
                        <IoExitOutline />
                        <span>Rời phòng chat</span>
                    </h3>
                    <button
                        type="button"
                        className="chat-modal-close-btn"
                        onClick={onClose}
                        aria-label="Đóng"
                        disabled={isLoading}
                    >
                        <IoClose />
                    </button>
                </div>

                <div className="chat-modal-body">
                    <p style={{ margin: '0 0 12px', fontSize: '15px', color: '#1f2937', lineHeight: '1.5' }}>
                        Bạn có chắc chắn muốn rời khỏi phòng{' '}
                        <strong style={{ color: '#111827' }}>"{roomName}"</strong> không?
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                        Sau khi rời, bạn sẽ không còn nhận được tin nhắn và phòng này sẽ được xóa khỏi danh sách trò chuyện của bạn.
                    </p>
                </div>

                <div className="chat-modal-footer">
                    <button
                        type="button"
                        className="chat-modal-btn chat-modal-btn-secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        className="chat-modal-btn chat-modal-btn-danger"
                        onClick={() => onConfirm(roomName)}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang rời...' : 'Rời phòng'}
                    </button>
                </div>
            </div>
        </div>
    );
};
