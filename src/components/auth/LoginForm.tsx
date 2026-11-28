import { useState, useEffect } from "react";
import { ws } from "../../services/websocket";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppRedux";
import { loginSuccess, loginFailure } from "../../store/slices/authSlice";
import type { WsResponse } from "../../types/chat";
import "./LoginForm.css";

interface Props {
    onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const dispatch = useAppDispatch();
    const { error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const onMessage = (res: WsResponse) => {
            if (res.event === "LOGIN") {
                setLoading(false);
                if (res.status === "success" && res.data) {
                    dispatch(
                        loginSuccess({
                            username: username.trim(),
                            reLoginCode: res.data.RE_LOGIN_CODE,
                        })
                    );
                } else {
                    dispatch(loginFailure(res.mes || "Đăng nhập thất bại"));
                }
            }
        };

        ws.addMessageListener(onMessage);
        return () => {
            ws.removeMessageListener(onMessage);
        };
    }, [dispatch, username]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password) {
            dispatch(loginFailure("Vui lòng nhập đầy đủ thông tin"));
            return;
        }

        setLoading(true);
        ws.send("LOGIN", { user: username.trim(), pass: password });
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Đăng nhập</h2>

            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="login-form-group">
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        className="login-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="login-form-group">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading} className="login-button">
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
            </form>

            <p className="login-switch">
                Chưa có tài khoản?{" "}
                <span onClick={onSwitchToRegister} className="login-link">
          Đăng ký
        </span>
            </p>
        </div>
    );
}