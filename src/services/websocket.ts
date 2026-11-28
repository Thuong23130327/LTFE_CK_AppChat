import type {WsRequest, WsResponse} from "../types/chat";

type MessageListener = (data: WsResponse) => void;
type StatusListener = (isConnected: boolean) => void;

class WebSocketService {
    private url: string = "wss://chat.longapp.io.vn/chat/chat";
    private static instance: WebSocketService;
    private socket: WebSocket | null = null;
    private listeners: MessageListener[] = [];
    private isConnecting: boolean = false;
    private pendingQueue: string[] = [];
    private statusListeners: StatusListener[] = [];
    private isConnected: boolean = false;

    private constructor() {
    }

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
            this.isConnected = true;
            this.notifyStatus();
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

        this.socket.onerror = () => {
            this.isConnected = false;
            this.notifyStatus();
        };

        this.socket.onclose = () => {
            this.isConnecting = false;
            this.isConnected = false;
            console.log("WebSocket closed. Reconnecting...");
            this.isConnecting = false;
            this.notifyStatus();
            setTimeout(() => this.connect(), 5000);
        };
    }

    public send(event: string, data?: unknown): void {
        const payload: WsRequest = {
            action: "onchat",
            data: data !== undefined ? {event, data} : {event},
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

    private notifyStatus(): void {
        this.statusListeners.forEach((listener) => listener(this.isConnected));
    }

    public getStatus(): boolean {
        return this.isConnected;
    }

    public addStatusListener(listener: StatusListener): void {
        this.statusListeners.push(listener);
        listener(this.isConnected);
    }

    public removeStatusListener(listener: StatusListener): void {
        this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    }
}

export const ws = WebSocketService.getInstance();