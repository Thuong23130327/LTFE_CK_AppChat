import { useState, useEffect } from "react";
import { ws } from "../../services/websocket";
import type { WsResponse } from "../../types/chat";
import "./RegisterForm.css";

interface Props {
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onMessage = (res: WsResponse) => {
            if (res.event === "REGISTER") {
                setLoading(false);
                if (res.status === "success") {
                    setSuccess("Đăng ký thành công! Đang chuyển sang đăng nhập");
                    setErr("");
                    setTimeout(() => {
                        onSwitchToLogin();
                    }, 1500);
                } else {
                    setErr(res.mes || "Đăng ký thất bại");
                    setSuccess("");
                }
            }
        };

        ws.addMessageListener(onMessage);
        return () => {
            ws.removeMessageListener(onMessage);
        };
    }, [onSwitchToLogin]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password || !confirmPassword) {
            setErr("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (password.length < 6) {
            setErr("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (password !== confirmPassword) {
            setErr("Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);
        setErr("");
        setSuccess("");
        ws.send("REGISTER", { user: username.trim(), pass: password });
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Đăng ký tài khoản</h2>

            {err && <p className="auth-error">{err}</p>}
            {success && <p className="auth-success">{success}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        className="form-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading} className="auth-button">
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>

            <p className="auth-switch">
                Đã có tài khoản?{" "}
                <span onClick={onSwitchToLogin} className="auth-link">
          Đăng nhập ngay
        </span>
            </p>
        </div>
    );
}