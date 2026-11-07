import type { ConversationItemType } from '../types/chat';

export const mockConversations: ConversationItemType[] = [
    { id: '1', name: 'Nhóm Đồ Án LTFE', type: 1, avatar: 'https://i.pravatar.cc/150?u=1', lastMessage: 'Push code lên đi Phát ơi', actionTime: '18:05', isOnline: true },
    { id: '2', name: 'Nguyễn Hoài Thương', type: 0, avatar: 'https://i.pravatar.cc/150?u=2', lastMessage: 'Ok nhe', actionTime: '17:30', isOnline: false },
    { id: '3', name: 'Tiểu Yến', type: 0, avatar: 'https://i.pravatar.cc/150?u=3', lastMessage: 'Aloooooooooo', actionTime: '16:45', isOnline: true },
    { id: '4', name: 'abc', type: 0, avatar: 'https://i.pravatar.cc/150?u=4', lastMessage: 'Gửi tui file báo cáo', actionTime: 'Hôm qua', isOnline: false },
    { id: '5', name: 'Nhóm Radio Nông Lâm', type: 1, avatar: 'https://i.pravatar.cc/150?u=5', lastMessage: 'Chốt kịch bản video nhé', actionTime: 'Thứ 3', isOnline: true },
];