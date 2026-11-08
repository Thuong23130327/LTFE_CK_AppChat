import "./App.css";
import { Sidebar } from "./components/chat/Sidebar";
import { useEffect } from "react";
import { ws } from "./services/websocket";

export default function App() {
  useEffect(() => {
    ws.connect();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="chat-wrapper">
        <div className="chat-header">Chat Header</div>
        <div className="chat-content">
          <p className="placeholder-text">Nội dung chat </p>
        </div>
      </main>
    </div>
  );
}
