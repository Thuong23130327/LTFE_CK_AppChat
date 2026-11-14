import React, { useEffect, useRef, useState } from 'react';
import './Sidebar.css';
import { ConversationItem } from './ConversationItem';
import { ws } from '../../services/websocket';
import { WS_EVENTS, type ConversationItemType, type WsResponse } from '../../types/chat';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { logout } from '../../store/slices/authSlice';
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
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomError, setRoomError] = useState('');
    const [searchStatusMsg, setSearchStatusMsg] = useState('');

    // lưu tên user hoặc phòng đang thao tác để xử lý response bất đồng bộ từ WebSocket
    const pendingSearchUserRef = useRef<string>('');
    const pendingRoomNameRef = useRef<string>('');

    // gọi GET_USER_LIST khi đã xác thực thành công
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
                    if (res.status === 'success' && pendingSearchUserRef.current === '') {
                        if (res.data && typeof res.data.user === 'string') {
                            dispatch(
                                updateUserOnlineStatus({
                                    name: res.data.user,
                                    isOnline: Boolean(res.data.status),
                                })
                            );
                        }
                    }
                    break;
                }

                case WS_EVENTS.CHECK_USER_EXIST: {
                    const searchedUser = pendingSearchUserRef.current;
                    if (!searchedUser) break;

                    const exists = Boolean(res.data?.status ?? res.data === true);
                    if (res.status === 'success' && exists) {
                        const newConv: ConversationItemType = {
                            name: searchedUser,
                            type: 0,
                            actionTime: new Date().toTimeString().slice(0, 5),
                        };
                        dispatch(upsertConversation(newConv));
                        dispatch(setActiveConversation(newConv));
                        setSearchTerm('');
                        setSearchStatusMsg('');
                    } else {
                        setSearchStatusMsg(`Không tìm thấy người dùng "${searchedUser}"`);
                    }
                    pendingSearchUserRef.current = '';
                    break;
                }

                case WS_EVENTS.CREATE_ROOM:
                case WS_EVENTS.JOIN_ROOM: {
                    if (res.status === 'success') {
                        const targetRoom = pendingRoomNameRef.current || res.data?.name;
                        if (targetRoom) {
                            const newRoom: ConversationItemType = {
                                name: targetRoom,
                                type: 1,
                                actionTime: new Date().toTimeString().slice(0, 5),
                            };
                            dispatch(upsertConversation(newRoom));
                            dispatch(setActiveConversation(newRoom));
                        }
                        ws.send(WS_EVENTS.GET_USER_LIST);
                        setRoomName('');
                        setRoomError('');
                        setShowRoomModal(false);
                    } else {
                        setRoomError(res.mes || 'Thao tác phòng thất bại');
                    }
                    pendingRoomNameRef.current = '';
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

    // lọc list chat theo từ khóa tìm kiếm
    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const handleSearchUserOnServer = () => {
        const keyword = searchTerm.trim();
        if (!keyword) return;
        setSearchStatusMsg('Đang tìm người dùng...');
        pendingSearchUserRef.current = keyword;
        ws.send(WS_EVENTS.CHECK_USER_EXIST, { user: keyword });
    };

    const handleRoomAction = (eventType: 'CREATE_ROOM' | 'JOIN_ROOM') => {
        const trimmed = roomName.trim();
        if (!trimmed) {
            setRoomError('Vui lòng nhập tên phòng');
            return;
        }
        setRoomError('');
        pendingRoomNameRef.current = trimmed;
        ws.send(WS_EVENTS[eventType], { name: trimmed });
    };

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
                        title="Tạo / Tham gia phòng"
                        onClick={() => {
                            setShowRoomModal((prev) => !prev);
                            setRoomError('');
                        }}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                    >
                        ➕
                    </button>
                    <button title="Đăng xuất" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                        🚪
                    </button>
                </div>
            </div>

            {/* form tạo hoặc tham gia phòng nhanh */}
            {showRoomModal && (
                <div style={{ padding: '10px 16px', background: '#f5f7fb', borderBottom: '1px solid #ddd' }}>
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Nhập tên phòng..."
                        style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            marginBottom: '8px',
                            boxSizing: 'border-box',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => handleRoomAction('CREATE_ROOM')}
                            style={{ flex: 1, padding: '6px', cursor: 'pointer' }}
                        >
                            Tạo phòng
                        </button>
                        <button
                            onClick={() => handleRoomAction('JOIN_ROOM')}
                            style={{ flex: 1, padding: '6px', cursor: 'pointer' }}
                        >
                            Tham gia
                        </button>
                    </div>
                    {roomError && (
                        <p style={{ color: 'red', fontSize: '12px', margin: '6px 0 0' }}>{roomError}</p>
                    )}
                </div>
            )}

            {/* thanh tìm kiếm */}
            <div className="sidebar-search" style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSearchStatusMsg('');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredConversations.length === 0) {
                            handleSearchUserOnServer();
                        }
                    }}
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
                {searchTerm.trim() !== '' && (
                    <button
                        onClick={handleSearchUserOnServer}
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px dashed #888',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}
                    >
                        🔍 Tìm người dùng mới "{searchTerm.trim()}" trên hệ thống
                    </button>
                )}
                {searchStatusMsg && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '6px 0 0' }}>
                        {searchStatusMsg}
                    </p>
                )}
            </div>

            {/* list chat */}
            <div className="sidebar-content" style={{ padding: 0 }}>
                {isLoadingList ? (
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
        </div>
    );
};