import "./App.css";
import { Sidebar } from "./components/chat/Sidebar";
import { ChatArea } from "./components/chat/ChatArea";
import { useEffect, useState } from "react";
import { ws } from "./services/websocket";
import { useAppSelector } from "./hooks/useAppRedux";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { useAuthInit } from "./hooks/useAuthInit";
function LoadingScreen() {
  return (
      <div style={{ display: "flex", height: "300px", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <h3>Đang kết nối...</h3>
        <p style={{ color: "black", fontSize: 14 }}>Vui lòng đợi trong giây lát</p>
      </div>
  );
}
export default function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { isAuthenticated, isCheckingAuth  } = useAppSelector((state) => state.auth);
  useAuthInit();
  useEffect(() => {
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
    <div className="app-container">
      <Sidebar />

      <main className="chat-wrapper">
        <ChatArea />
      </main>
    </div>
  );
}