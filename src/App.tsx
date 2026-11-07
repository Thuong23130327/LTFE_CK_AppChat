import "./App.css";
import { Sidebar } from "./components/chat/Sidebar";

export default function App() {
    return (
        <div className="app-container">
            {/* 1. Gọi component Sidebar của bạn thay thế cho phần aside tĩnh */}
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