import "./App.css";
import { Sidebar } from "./components/chat/Sidebar";
import { ChatArea } from "./components/chat/ChatArea";
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
        <ChatArea />
      </main>
    </div>
  );
}
