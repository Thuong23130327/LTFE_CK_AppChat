import "./App.css";
import { Sidebar } from "./components/chat/Sidebar";
import { ChatArea } from "./components/chat/ChatArea";
import { useEffect } from "react";
import { ws } from "./services/websocket";
import { WS_EVENTS, type WsResponse } from "./types/chat";
import { useAppDispatch, useAppSelector } from "./hooks/useAppRedux";
import { loginSuccess, logout } from "./store/slices/authSlice";

const TEST_USER = "tanphat_nhom5";
const TEST_PASS = "123456";

export default function App() {
    const dispatch = useAppDispatch();
    const { username, reLoginCode } = useAppSelector((state) => state.auth);

    useEffect(() => {
        ws.connect();

        const handleAuthEvents = (res: WsResponse) => {
            // khi LOGIN hoặc RE_LOGIN thành công -> lưu mã code mới và kích hoạt GET_USER_LIST
            if (
                (res.event === WS_EVENTS.LOGIN || res.event === WS_EVENTS.RE_LOGIN) &&
                res.status === "success"
            ) {
                const activeUser = localStorage.getItem("username") || TEST_USER;
                dispatch(
                    loginSuccess({
                        username: activeUser,
                        reLoginCode: res.data?.RE_LOGIN_CODE || "",
                    })
                );
            }

            // nếu RE_LOGIN hết hạn (> 2h) -> xóa session cũ và login lại bằng user/pass test
            if (res.event === WS_EVENTS.RE_LOGIN && res.status === "error") {
                dispatch(logout());
                ws.send(WS_EVENTS.LOGIN, { user: TEST_USER, pass: TEST_PASS });
            }

            // nếu tài khoản test chưa tồn tại trên server -> tự đăng ký rồi đăng nhập
            if (res.event === WS_EVENTS.LOGIN && res.status === "error") {
                ws.send(WS_EVENTS.REGISTER, { user: TEST_USER, pass: TEST_PASS });
            }

            if (res.event === WS_EVENTS.REGISTER && res.status === "success") {
                ws.send(WS_EVENTS.LOGIN, { user: TEST_USER, pass: TEST_PASS });
            }
        };

        ws.addMessageListener(handleAuthEvents);

        // nếu đã có sẵn username + reLoginCode trong localStorage -> gọi RE_LOGIN theo đúng spec
        if (username && reLoginCode) {
            ws.send(WS_EVENTS.RE_LOGIN, { user: username, code: reLoginCode });
        } else {
            ws.send(WS_EVENTS.LOGIN, { user: TEST_USER, pass: TEST_PASS });
        }

        return () => {
            ws.removeMessageListener(handleAuthEvents);
        };
    }, [dispatch]);

    return (
        <div className="app-container">
            <Sidebar />
            <main className="chat-wrapper">
                <ChatArea />
            </main>
        </div>
    );
}