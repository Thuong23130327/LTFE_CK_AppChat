import { useState, useEffect } from "react";
import { ws } from "../../services/websocket";

interface Props {
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onMessage = (res: any) => {
            if (res.event === "REGISTER") {
                setLoading(false);
                if (res.status === "success") {
                    setSuccess("Đăng ký thành công, hãy đăng nhập");
                    setErr("");
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
    }, []);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        setErr("");
        setSuccess("");
        ws.send("REGISTER", { user: username, pass: password });
    };

    return (
        <div style={{ width: 320, margin: "100px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
            <h2 style={{ textAlign: "center" }}>Đăng ký</h2>

            {err && <p style={{ color: "red", fontSize: 13 }}>{err}</p>}
            {success && <p style={{ color: "green", fontSize: 13 }}>{success}</p>}

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
                    style={{ width: "100%", padding: 10, background: "#28a745", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                >
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>

            <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
                Đã có tài khoản?{" "}
                <span onClick={onSwitchToLogin} style={{ color: "#0066cc", cursor: "pointer" }}>
                    Đăng nhập ngay
                </span>
            </p>
        </div>
    );
}