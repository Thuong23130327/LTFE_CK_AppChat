import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConversationItemType, RoomMemberType } from "../../types/chat";

interface ChatState {
    conversations: ConversationItemType[];
    activeConversation: ConversationItemType | null;
    activeRoomMembers: RoomMemberType[];
    isLoadingList: boolean;
    roomToLeave: string | null;
}

const initialState: ChatState = {
    conversations: [],
    activeConversation: null,
    activeRoomMembers: [],
    isLoadingList: false,
    roomToLeave: null,
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setLoadingList: (state, action: PayloadAction<boolean>) => {
            state.isLoadingList = action.payload;
        },
        setConversations: (state, action: PayloadAction<ConversationItemType[]>) => {
            const incomingKeys = new Set(
                action.payload.map((item) => `${item.type}-${item.name}`)
            );

            // Giữ lại các cuộc trò chuyện đang có trong state mà server chưa kịp trả về trong GET_USER_LIST
            const existingUnlisted = state.conversations.filter(
                (item) => !incomingKeys.has(`${item.type}-${item.name}`)
            );

            const oldMap = new Map(
                state.conversations.map((item) => [`${item.type}-${item.name}`, item])
            );

            const updatedIncoming = action.payload.map((item) => {
                const key = `${item.type}-${item.name}`;
                const existing = oldMap.get(key);
                return {
                    ...existing,
                    ...item,
                    lastMessage: item.lastMessage ?? existing?.lastMessage,
                    unreadCount: item.unreadCount !== undefined ? item.unreadCount : (existing?.unreadCount ?? 0),
                    id: key,
                };
            });

            state.conversations = [...updatedIncoming, ...existingUnlisted];
            state.isLoadingList = false;
        },
        setActiveConversation: (state, action: PayloadAction<ConversationItemType | null>) => {
            state.activeConversation = action.payload;
            if (action.payload) {
                const target = state.conversations.find(
                    (c) => c.type === action.payload!.type && c.name === action.payload!.name
                );
                if (target) {
                    target.unreadCount = 0;
                }
            }
            if (!action.payload || action.payload.type === 0) {
                state.activeRoomMembers = [];
            }
        },
        setActiveRoomMembers: (state, action: PayloadAction<RoomMemberType[]>) => {
            state.activeRoomMembers = action.payload;
        },
        upsertConversation: (state, action: PayloadAction<ConversationItemType & { _incrementUnread?: boolean }>) => {
            const { _incrementUnread, ...rest } = action.payload as any;
            const incoming = {
                ...rest,
                id: `${rest.type}-${rest.name}`,
            };
            const idx = state.conversations.findIndex(
                (c) => c.type === incoming.type && c.name === incoming.name
            );

            if (idx !== -1) {
                const existing = state.conversations[idx];
                let unreadCount: number;
                if (_incrementUnread) {
                    unreadCount = (existing.unreadCount || 0) + 1;
                } else if (incoming.unreadCount !== undefined) {
                    unreadCount = incoming.unreadCount;
                } else {
                    unreadCount = existing.unreadCount || 0;
                }

                const merged = {
                    ...existing,
                    ...incoming,
                    unreadCount,
                };
                state.conversations.splice(idx, 1);
                state.conversations.unshift(merged);
            } else {
                state.conversations.unshift(incoming);
            }
        },
        markConversationAsRead: (
            state,
            action: PayloadAction<{ type: 0 | 1; name: string }>
        ) => {
            const target = state.conversations.find(
                (c) => c.type === action.payload.type && c.name === action.payload.name
            );
            if (target) {
                target.unreadCount = 0;
            }
            if (
                state.activeConversation?.type === action.payload.type &&
                state.activeConversation.name === action.payload.name
            ) {
                state.activeConversation.unreadCount = 0;
            }
        },
        removeRoomConversation: (state, action: PayloadAction<string>) => {
            state.conversations = state.conversations.filter(
                (c) => !(c.type === 1 && c.name === action.payload)
            );
            if (
                state.activeConversation?.type === 1 &&
                state.activeConversation.name === action.payload
            ) {
                state.activeConversation = null;
                state.activeRoomMembers = [];
            }
        },
        updateUserOnlineStatus: (
            state,
            action: PayloadAction<{ name: string; isOnline: boolean }>
        ) => {
            const target = state.conversations.find(
                (c) => c.type === 0 && c.name === action.payload.name
            );
            if (target) {
                target.isOnline = action.payload.isOnline;
            }
            if (
                state.activeConversation?.type === 0 &&
                state.activeConversation.name === action.payload.name
            ) {
                state.activeConversation.isOnline = action.payload.isOnline;
            }
        },
        setRoomToLeave: (state, action: PayloadAction<string | null>) => {
            state.roomToLeave = action.payload;
        },
        resetChatState: (state) => {
            state.conversations = [];
            state.activeConversation = null;
            state.activeRoomMembers = [];
            state.isLoadingList = false;
            state.roomToLeave = null;
        },
    },
});

export const {
    setLoadingList,
    setConversations,
    setActiveConversation,
    setActiveRoomMembers,
    upsertConversation,
    removeRoomConversation,
    updateUserOnlineStatus,
    resetChatState,
    setRoomToLeave,
    markConversationAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;