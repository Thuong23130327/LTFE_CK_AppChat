export interface ConversationItemType {
    id: string;
    name: string;
    type: number;
    avatar: string;
    lastMessage: string;
    time: string;
    isOnline: boolean;
}

export const mockConversations: ConversationItemType[] = [
    { id: '1', name: 'Nhóm Đồ Án LTFE', type: 1, avatar: 'https://i.pravatar.cc/150?u=1', lastMessage: 'Push code lên đi Phát ơi', time: '18:05', isOnline: true },
    { id: '2', name: 'Nguyễn Hoài Thương', type: 0, avatar: 'https://i.pravatar.cc/150?u=2', lastMessage: 'Ok nhe', time: '17:30', isOnline: false },
    { id: '3', name: 'Trần Hải Yến', type: 0, avatar: 'https://i.pravatar.cc/150?u=3', lastMessage: 'Đang làm UI MessageBubble rùi', time: '16:45', isOnline: true },
    { id: '4', name: 'Bá Học', type: 0, avatar: 'https://i.pravatar.cc/150?u=4', lastMessage: 'Gửi tớ xin file báo cáo', time: 'Hôm qua', isOnline: false },
    { id: '5', name: 'Nhóm Radio Nông Lâm', type: 1, avatar: 'https://i.pravatar.cc/150?u=5', lastMessage: 'Chốt kịch bản video nhé', time: 'Thứ 3', isOnline: true },
];