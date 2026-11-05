import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      <aside className="sidebar-wrapper">
        <div className="sidebar-header">Sidebar Header</div>
        <div className="sidebar-content">
          <p className="placeholder-text">Danh sách cuộc trò chuyện</p>
        </div>
      </aside>

      <main className="chat-wrapper">
        <div className="chat-header">Chat Header</div>
        <div className="chat-content">
          <p className="placeholder-text">Nội dung chat </p>
        </div>
      </main>
    </div>
  );
}