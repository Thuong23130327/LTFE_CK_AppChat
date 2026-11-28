import "./App.css";
import { Sidebar } from "./components/chat/Sidebar";
import { ChatArea } from "./components/chat/ChatArea";
import { useEffect, useState } from "react";
import { ws } from "./services/websocket";
import { useAppDispatch, useAppSelector } from "./hooks/useAppRedux";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { useAuthInit } from "./hooks/useAuthInit";
import { setActiveConversation } from "./store/slices/chatSlice";
import "./darkmode.css";






function LoadingScreen() {
    return (
        <div style={{ display: "flex", height: "300px", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <h3>Đang kết nối...</h3>
            <p style={{ color: "gray", fontSize: 14 }}>Vui lòng đợi trong giây lát</p>
        </div>
    );
}

export default function App() {
    const [isLoginView, setIsLoginView] = useState(true);
    const dispatch = useAppDispatch();
    const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth);
    const { activeConversation } = useAppSelector((state) => state.chat);

    useAuthInit();
    useEffect(() => {
        if (localStorage.getItem("darkMode") === "true") {
            document.body.classList.add("dark");
        }
        ws.connect();
    }, []);
    if (isCheckingAuth) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return isLoginView ? (
            <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
        ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
        );
    }

    return (
        <div className={activeConversation ? "app-container chat-open" : "app-container"}>
            <Sidebar />

            <main className="chat-wrapper">
                {activeConversation && (
                    <div className="mobile-back-bar">
                        <button
                            type="button"
                            className="mobile-back-btn"
                            onClick={() => dispatch(setActiveConversation(null))}
                        >
                            ← Danh sách chat
                        </button>
                    </div>
                )}
                <ChatArea />
            </main>
        </div>
    );
}