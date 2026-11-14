import type { WsRequest, WsResponse } from "../types/chat";
type MessageListener = (data: WsResponse) => void;

class WebSocketService {
  private url: string = "wss://chat.longapp.io.vn/chat/chat";
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private listeners: MessageListener[] = [];
  private isConnecting: boolean = false;
  private pendingQueue: string[] = [];

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected.");
      this.isConnecting = false;
      while (this.pendingQueue.length > 0) {
        const msg = this.pendingQueue.shift();
        if (msg && this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(msg);
        }
      }
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const data: WsResponse = JSON.parse(event.data);
      this.listeners.forEach((listener) => listener(data));
    };

    this.socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onclose = () => {
      console.log("WebSocket closed. Reconnecting...");
      this.isConnecting = false;
      setTimeout(() => this.connect(), 5000);
    };
  }

  public send(event: string, data?: unknown): void {
    const payload: WsRequest = {
      action: "onchat",
      data: data !== undefined ? { event, data } : { event },
    };
    const serialized = JSON.stringify(payload);

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.pendingQueue.push(serialized);
      this.connect();
      return;
    }

    this.socket.send(serialized);
  }

  public addMessageListener(listener: MessageListener): void {
    this.listeners.push(listener);
  }

  public removeMessageListener(listener: MessageListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}

export const ws = WebSocketService.getInstance();