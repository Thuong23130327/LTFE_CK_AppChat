import "./App.css";
import { Sidebar } from "./components/chat/Sidebar";
import { ChatArea } from "./components/chat/ChatArea";
import { useEffect, useState } from "react";
import { ws } from "./services/websocket";
import { useAppSelector } from "./hooks/useAppRedux";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";

export default function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    ws.connect();
  }, []);

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