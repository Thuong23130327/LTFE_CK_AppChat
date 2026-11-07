export interface WsRequest<T = any> {
    action: "onchat";
    data: {
        event: string; data?: T;
    };
}

export interface WsResponse<T = any> {
    status: "success" | "error";
    event: string;
    data?: T;
    mes?: string;
}

export interface LoginResponseData {
    RE_LOGIN_CODE: string;
}

export interface UserAuthInfo {
    username: string;
    reLoginCode?: string;
    isAuthenticated: boolean;
}

// Đã bổ sung các trường UI vào thẳng interface gốc
export interface ConversationItemType {
    id: string;
    name: string;
    type: 0 | 1;
    actionTime: string;
    avatar?: string;
    lastMessage?: string;
    isOnline?: boolean;
}

export interface ChatMessageType {
    id: number;
    name: string;
    to: string;
    mes: string;
    createAt: string;
    type: 0 | 1;
}

export const WS_EVENTS = {
    REGISTER: "REGISTER",
    LOGIN: "LOGIN",
    RE_LOGIN: "RE_LOGIN",
    LOGOUT: "LOGOUT",
    GET_USER_LIST: "GET_USER_LIST",
    CHECK_USER_EXIST: "CHECK_USER_EXIST",
    CHECK_USER_ONLINE: "CHECK_USER_ONLINE",
    CREATE_ROOM: "CREATE_ROOM",
    JOIN_ROOM: "JOIN_ROOM",
    GET_ROOM_CHAT_MES: "GET_ROOM_CHAT_MES",
    OUT_ROOM: "OUT_ROOM",
    GET_PEOPLE_CHAT_MES: "GET_PEOPLE_CHAT_MES",
    SEND_CHAT: "SEND_CHAT",
} as const;