import React, {useEffect, useState, useRef} from 'react';
import './Sidebar.css';
import {IoPersonAddOutline, IoEnterOutline, IoLogOutOutline} from 'react-icons/io5';
import {ConversationItem} from './ConversationItem';
import {DirectChatModal} from './DirectChatModal';
import {JoinRoomModal} from './JoinRoomModal';
import {LeaveRoomModal} from './LeaveRoomModal';
import {ws} from '../../services/websocket';
import {WS_EVENTS, type ConversationItemType, type WsResponse} from '../../types/chat';
import {useAppDispatch, useAppSelector} from '../../hooks/useAppRedux';
import {logout} from '../../store/slices/authSlice';
import {
    resetChatState,
    setActiveConversation,
    setConversations,
    setLoadingList,
    updateUserOnlineStatus,
    upsertConversation,
    removeRoomConversation,
    setRoomToLeave,
} from '../../store/slices/chatSlice';
import {LogoutModal} from '../auth/LogoutModal';
import {ConnectionBadge} from '../auth/ConnectionBadge';
import { ThemeToggle } from "../auth/ThemeToggle";




export const Sidebar: React.FC = () => {

    const dispatch = useAppDispatch();
    const {username, isAuthenticated} = useAppSelector((state) => state.auth);
    const {conversations, activeConversation, isLoadingList, roomToLeave} = useAppSelector(
        (state) => state.chat
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDirectChatModalOpen, setIsDirectChatModalOpen] = useState(false);
    const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
    const [isLeavingRoom, setIsLeavingRoom] = useState(false);
    const checkQueueRef = useRef<string[]>([]);
    const pendingLeaveRoomRef = useRef<string>('');

    const checkUserOnline = (targetUser: string) => {
        checkQueueRef.current.push(targetUser);
        ws.send(WS_EVENTS.CHECK_USER_ONLINE, {user: targetUser});
    };
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
                                checkUserOnline(item.name);
                            }
                        });
                    } else {
                        dispatch(setLoadingList(false));
                    }
                    break;
                }

                case WS_EVENTS.CHECK_USER_ONLINE: {
                    const targetUser = checkQueueRef.current.shift();
                    if (res.status === 'success' && res.data && targetUser) {
                        dispatch(
                            updateUserOnlineStatus({
                                name: targetUser,
                                isOnline: Boolean(res.data.status),
                            })
                        );
                    }
                    break;
                }

                case WS_EVENTS.SEND_CHAT: {
                    if (res.status === 'success' && res.data) {
                        const msg = res.data;
                        const isRoom = msg.type === 1 || msg.type === '1' || msg.type === 'room';
                        const convName = isRoom
                            ? (msg.to || msg.room || msg.roomName)
                            : msg.name === username
                                ? msg.to
                                : msg.name;

                        if (convName) {
                            const now = new Date();
                            const formattedTime = msg.createAt
                                ? (msg.createAt.includes(' ') ? msg.createAt.split(' ')[1].slice(0, 5) : msg.createAt.slice(0, 5))
                                : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                            dispatch(
                                upsertConversation({
                                    name: convName,
                                    type: isRoom ? 1 : 0,
                                    lastMessage: msg.mes || msg.message,
                                    actionTime: formattedTime,
                                })
                            );
                        }
                    }
                    break;
                }

                case WS_EVENTS.OUT_ROOM: {
                    const targetRoom = pendingLeaveRoomRef.current;
                    setIsLeavingRoom(false);
                    if (res.status === 'success') {
                        if (targetRoom) {
                            dispatch(removeRoomConversation(targetRoom));
                        }
                        ws.send(WS_EVENTS.GET_USER_LIST);
                    } else {
                        alert(res.mes || 'Không thể rời phòng chat');
                    }
                    pendingLeaveRoomRef.current = '';
                    break;
                }
            }
        };

        ws.addMessageListener(handleWsMessage);
        return () => ws.removeMessageListener(handleWsMessage);
    }, [dispatch, username]);
    useEffect(() => {
        if (!activeConversation || activeConversation.type !== 0) return;

        const timer = setInterval(() => {
            checkUserOnline(activeConversation.name);
        }, 10000);

        return () => clearInterval(timer);
    }, [activeConversation?.name, activeConversation?.type]);
    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const handleLogout = () => {
        ws.send(WS_EVENTS.LOGOUT);
        dispatch(logout());
        dispatch(resetChatState());
    };

    const handleConfirmLeaveRoom = (targetRoomName: string) => {
        setIsLeavingRoom(true);
        pendingLeaveRoomRef.current = targetRoomName;
        ws.send(WS_EVENTS.OUT_ROOM, { name: targetRoomName });
        dispatch(setRoomToLeave(null));
    };

    const displayName = username || 'Khách';
    const myAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

    let style = {fontWeight: 600};
    return (
        <div className="sidebar-wrapper">
            <div
                className="sidebar-header"
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className="current-user" style={{display: 'flex', alignItems: 'center'}}>
                    <img src={myAvatar} alt="My Avatar" className="avatar-small"/>
                    <div style={{marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '2px'}}>
        <span className="username" style={style}>
            {displayName}
        </span>
                        <ConnectionBadge/>
                    </div>
                </div>
                <div className="sidebar-actions">
                    <button
                        type="button"
                        className="sidebar-action-btn"
                        title="Bắt đầu chat 1-1"
                        onClick={() => setIsDirectChatModalOpen(true)}
                        aria-label="Bắt đầu chat 1-1"
                    >
                        <IoPersonAddOutline/>
                    </button>
                    <button
                        type="button"
                        className="sidebar-action-btn"
                        title="Tham gia phòng"
                        onClick={() => setIsJoinRoomModalOpen(true)}
                        aria-label="Tham gia phòng"
                    >
                        <IoEnterOutline/>
                    </button>
                    <ThemeToggle />
                    <button
                        type="button"
                        className="sidebar-action-btn logout"
                        title="Đăng xuất"
                        onClick={() => setShowLogoutModal(true)}
                        aria-label="Đăng xuất"
                    >
                        <IoLogOutOutline/>

                    </button>
                </div>
            </div>

            {/* thanh tìm kiếm hội thoại hiện có trong danh sách */}
            <div className="sidebar-search" style={{padding: '12px 16px', borderBottom: '1px solid #ddd'}}>
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
            <div className="sidebar-content" style={{padding: 0}}>
                {isLoadingList && conversations.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#888', padding: '16px'}}>
                        Đang tải danh sách trò chuyện...
                    </p>
                ) : filteredConversations.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#888', padding: '16px', fontSize: '14px'}}>
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
                                    onClick={() => {
                                        dispatch(setActiveConversation(conv));
                                        if (conv.type === 0) {
                                            checkUserOnline(conv.name);
                                        }
                                    }}
                                    onLeaveRoom={(roomName) => dispatch(setRoomToLeave(roomName))}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                }}/>


            <DirectChatModal
                isOpen={isDirectChatModalOpen}
                onClose={() => setIsDirectChatModalOpen(false)}
            />
            <JoinRoomModal
                isOpen={isJoinRoomModalOpen}
                onClose={() => setIsJoinRoomModalOpen(false)}
            />
            <LeaveRoomModal
                isOpen={Boolean(roomToLeave)}
                roomName={roomToLeave || ''}
                isLoading={isLeavingRoom}
                onClose={() => dispatch(setRoomToLeave(null))}
                onConfirm={handleConfirmLeaveRoom}
            />
        </div>
    );
};