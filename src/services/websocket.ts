import type { WsRequest, WsResponse } from "../types/chat";
type MessageListener = (data: WsResponse) => void;

class WebSocketService {
  private url: string = "wss://chat.longapp.io.vn/chat/chat";
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private listeners: MessageListener[] = [];
  private isConnecting: boolean = false;

  private constructor() { }
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.isConnecting) return;
    this.isConnecting = true;
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => {
      console.log("ok WebSocket connected.");
      this.isConnecting = false;
    };
    this.socket.onmessage = (event: MessageEvent) => {
      const data: WsResponse = JSON.parse(event.data);
      this.listeners.forEach((listener) => listener(data));
    };
    this.socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };
    this.socket.onclose = () => {
      console.log("WebSocket closed. Attempting to reconnect...");
      this.isConnecting = false;
      setTimeout(() => this.connect(), 5000);
    };
  }

  public send(event: string, data?: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected. Cannot send message.");
      return;
    }

    const payload: WsRequest = {
      action: "onchat",
      data: {
        event: event,
        data: data,
      },
    };
    this.socket.send(JSON.stringify(payload));
  }

  public addMessageListener(listener: MessageListener): void {
    this.listeners.push(listener);
  }
  public removeMessageListener(listener: MessageListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}

export const ws = WebSocketService.getInstance();

