import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { IoPersonAddOutline, IoEnterOutline, IoLogOutOutline } from 'react-icons/io5';
import { ConversationItem } from './ConversationItem';
import { DirectChatModal } from './DirectChatModal';
import { JoinRoomModal } from './JoinRoomModal';
import { ws } from '../../services/websocket';
import { WS_EVENTS, type ConversationItemType, type WsResponse } from '../../types/chat';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { logout } from '../../store/slices/authSlice';
import { mockConversations } from '../../data/mockConversations';
import {
    resetChatState,
    setActiveConversation,
    setConversations,
    setLoadingList,
    updateUserOnlineStatus,
    upsertConversation,
} from '../../store/slices/chatSlice';

export const Sidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { username, isAuthenticated } = useAppSelector((state) => state.auth);
    const { conversations, activeConversation, isLoadingList } = useAppSelector(
        (state) => state.chat
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [isDirectChatModalOpen, setIsDirectChatModalOpen] = useState(false);
    const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(setLoadingList(true));
            ws.send(WS_EVENTS.GET_USER_LIST);
        }
    }, [isAuthenticated, dispatch]);

    useEffect(() => {
        const handleWsMessage = (res: WsResponse) => {
            switch (res.event) {
                case WS_EVENTS.LOGIN:
                case WS_EVENTS.RE_LOGIN: {
                    if (res.status === 'success') {
                        dispatch(setLoadingList(true));
                        ws.send(WS_EVENTS.GET_USER_LIST);
                    }
                    break;
                }

                case WS_EVENTS.GET_USER_LIST: {
                    if (res.status === 'success' && Array.isArray(res.data)) {
                        const list: ConversationItemType[] = res.data;
                        dispatch(setConversations(list));

                        list.forEach((item) => {
                            if (item.type === 0) {
                                ws.send(WS_EVENTS.CHECK_USER_ONLINE, { user: item.name });
                            }
                        });
                    } else {
                        dispatch(setLoadingList(false));
                    }
                    break;
                }

                case WS_EVENTS.CHECK_USER_ONLINE: {
                    if (res.status === 'success' && res.data && typeof res.data.user === 'string') {
                        dispatch(
                            updateUserOnlineStatus({
                                name: res.data.user,
                                isOnline: Boolean(res.data.status),
                            })
                        );
                    }
                    break;
                }

                case WS_EVENTS.SEND_CHAT: {
                    if (res.status === 'success' && res.data) {
                        const msg = res.data;
                        const isRoom = msg.type === 1;
                        const convName = isRoom
                            ? msg.to
                            : msg.name === username
                                ? msg.to
                                : msg.name;

                        if (convName) {
                            dispatch(
                                upsertConversation({
                                    name: convName,
                                    type: isRoom ? 1 : 0,
                                    lastMessage: msg.mes,
                                    actionTime:
                                        msg.createAt || new Date().toTimeString().slice(0, 5),
                                })
                            );
                        }
                    }
                    break;
                }
            }
        };

        ws.addMessageListener(handleWsMessage);
        return () => ws.removeMessageListener(handleWsMessage);
    }, [dispatch, username]);

    const combinedConversations = (() => {
        const map = new Map<string, ConversationItemType>();

        conversations.forEach((conv) => {
            const key = `${conv.type}-${conv.name}`;
            map.set(key, conv);
        });

        mockConversations.forEach((mockConv) => {
            const key = `${mockConv.type}-${mockConv.name}`;
            if (!map.has(key)) {
                map.set(key, mockConv);
            }
        });

        return Array.from(map.values());
    })();

    const filteredConversations = combinedConversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const handleLogout = () => {
        ws.send(WS_EVENTS.LOGOUT);
        dispatch(logout());
        dispatch(resetChatState());
    };

    const displayName = username || 'Khách';
    const myAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

    return (
        <div className="sidebar-wrapper">
            <div
                className="sidebar-header"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div className="current-user" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={myAvatar} alt="My Avatar" className="avatar-small" />
                    <span className="username" style={{ marginLeft: '8px', fontWeight: 600 }}>
                        {displayName}
                    </span>
                </div>
                <div className="sidebar-actions">
                    <button
                        type="button"
                        className="sidebar-action-btn"
                        title="Bắt đầu chat 1-1"
                        onClick={() => setIsDirectChatModalOpen(true)}
                        aria-label="Bắt đầu chat 1-1"
                    >
                        <IoPersonAddOutline />
                    </button>
                    <button
                        type="button"
                        className="sidebar-action-btn"
                        title="Tham gia phòng"
                        onClick={() => setIsJoinRoomModalOpen(true)}
                        aria-label="Tham gia phòng"
                    >
                        <IoEnterOutline />
                    </button>
                    <button
                        type="button"
                        className="sidebar-action-btn logout"
                        title="Đăng xuất"
                        onClick={handleLogout}
                        aria-label="Đăng xuất"
                    >
                        <IoLogOutOutline />
                    </button>
                </div>
            </div>

            {/* thanh tìm kiếm hội thoại hiện có trong danh sách */}
            <div className="sidebar-search" style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm bạn bè, nhóm..."
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            {/* danh sách cuộc trò chuyện */}
            <div className="sidebar-content" style={{ padding: 0 }}>
                {isLoadingList && combinedConversations.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '16px' }}>
                        Đang tải danh sách trò chuyện...
                    </p>
                ) : filteredConversations.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '16px', fontSize: '14px' }}>
                        Chưa có cuộc trò chuyện nào
                    </p>
                ) : (
                    <div className="conversation-list">
                        {filteredConversations.map((conv) => {
                            const key = `${conv.type}-${conv.name}`;
                            const isActive =
                                activeConversation?.name === conv.name &&
                                activeConversation?.type === conv.type;

                            return (
                                <ConversationItem
                                    key={key}
                                    data={conv}
                                    isActive={isActive}
                                    onClick={() => dispatch(setActiveConversation(conv))}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <DirectChatModal
                isOpen={isDirectChatModalOpen}
                onClose={() => setIsDirectChatModalOpen(false)}
            />
            <JoinRoomModal
                isOpen={isJoinRoomModalOpen}
                onClose={() => setIsJoinRoomModalOpen(false)}
            />
        </div>
    );
};