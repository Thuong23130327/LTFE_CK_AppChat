import "./LogoutModal.css";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: Props) {
    if (!isOpen) return null;

    return (
        <div className="logout-modal-overlay">
            <div className="logout-modal-content">
                <h4>Xác nhận đăng xuất</h4>
                <p>Bạn chắc chắn muốn đăng xuất chứ ?</p>
                <div className="logout-modal-actions">
                    <button className="logout-btn-cancel" onClick={onClose}>
                        Quay lại
                    </button>
                    <button className="logout-btn-confirm" onClick={onConfirm}>
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}