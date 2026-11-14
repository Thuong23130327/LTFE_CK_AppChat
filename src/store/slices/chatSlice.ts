import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConversationItemType, RoomMemberType } from "../../types/chat";

interface ChatState {
    conversations: ConversationItemType[];
    activeConversation: ConversationItemType | null;
    activeRoomMembers: RoomMemberType[];
    isLoadingList: boolean;
}

const initialState: ChatState = {
    conversations: [],
    activeConversation: null,
    activeRoomMembers: [],
    isLoadingList: false,
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setLoadingList: (state, action: PayloadAction<boolean>) => {
            state.isLoadingList = action.payload;
        },
        setConversations: (state, action: PayloadAction<ConversationItemType[]>) => {
            const oldMap = new Map(
                state.conversations.map((item) => [`${item.type}-${item.name}`, item])
            );

            state.conversations = action.payload.map((item) => {
                const key = `${item.type}-${item.name}`;
                const existing = oldMap.get(key);
                return {
                    ...existing,
                    ...item,
                    id: key,
                };
            });
            state.isLoadingList = false;
        },
        setActiveConversation: (state, action: PayloadAction<ConversationItemType | null>) => {
            state.activeConversation = action.payload;
            if (!action.payload || action.payload.type === 0) {
                state.activeRoomMembers = [];
            }
        },
        setActiveRoomMembers: (state, action: PayloadAction<RoomMemberType[]>) => {
            state.activeRoomMembers = action.payload;
        },
        upsertConversation: (state, action: PayloadAction<ConversationItemType>) => {
            const incoming = {
                ...action.payload,
                id: `${action.payload.type}-${action.payload.name}`,
            };
            const idx = state.conversations.findIndex(
                (c) => c.type === incoming.type && c.name === incoming.name
            );

            if (idx !== -1) {
                const merged = { ...state.conversations[idx], ...incoming };
                state.conversations.splice(idx, 1);
                state.conversations.unshift(merged);
            } else {
                state.conversations.unshift(incoming);
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
        resetChatState: (state) => {
            state.conversations = [];
            state.activeConversation = null;
            state.activeRoomMembers = [];
            state.isLoadingList = false;
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
} = chatSlice.actions;

export default chatSlice.reducer;