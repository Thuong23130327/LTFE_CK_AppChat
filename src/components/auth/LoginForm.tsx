import { useState, useEffect } from "react";
import { ws } from "../../services/websocket";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppRedux";
import { loginSuccess, loginFailure } from "../../store/slices/authSlice";

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
        const onMessage = (res: any) => {
            if (res.event === "LOGIN") {
                setLoading(false);
                if (res.status === "success" && res.data) {
                    dispatch(
                        loginSuccess({
                            username: username,
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

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        ws.send("LOGIN", { user: username, pass: password });
    };

    return (
        <div style={{ width: 320, margin: "100px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
            <h2 style={{ textAlign: "center" }}>Đăng nhập</h2>

            {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", padding: 10, background: "#0066cc", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
            </form>

            <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
                Chưa có tài khoản?{" "}
                <span onClick={onSwitchToRegister} style={{ color: "#0066cc", cursor: "pointer" }}>
                    Đăng ký
                </span>
            </p>
        </div>
    );
}