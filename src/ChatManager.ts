import { UserManager } from './UserManager';

type ChatMessage = {
    id: string;
    from: string;
    to: string;
    content: string;
    timestamp: number;
};

export class ChatManager {
    private static instance: ChatManager;
    private chats: Map<string, ChatMessage[]> = new Map();
    private adminSubscriptions: Set<string> = new Set();

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ChatManager();
        }
        return this.instance;
    }

    public async sendMessage(from: string, to: string, content: string) {
        const message: ChatMessage = {
            id: this.generateId(),
            from,
            to,
            content,
            timestamp: Date.now()
        };

        const chatId = this.getChatId(from, to);
        if (!this.chats.has(chatId)) {
            this.chats.set(chatId, []);
        }
        this.chats.get(chatId)?.push(message);

        // Send to recipient
        await UserManager.getInstance().getUser(to)?.emit({
            type: 'chat_message',
            chatId,
            message
        });

        // Send to sender (for confirmation)
        await UserManager.getInstance().getUser(from)?.emit({
            type: 'chat_message',
            chatId,
            message
        });

        // Notify admins
        this.notifyAdmins(chatId, message);
    }

    public subscribeAdmin(adminId: string) {
        this.adminSubscriptions.add(adminId);
    }

    public unsubscribeAdmin(adminId: string) {
        this.adminSubscriptions.delete(adminId);
    }

    private async notifyAdmins(chatId: string, message: ChatMessage) {
        const promises = Array.from(this.adminSubscriptions).map(adminId =>
            UserManager.getInstance().getUser(adminId)?.emit({
                type: 'admin_chat_update',
                chatId,
                message
            })
        );
        await Promise.all(promises);
    }

    public getChatHistory(chatId: string) {
        return this.chats.get(chatId) || [];
    }

    private getChatId(user1: string, user2: string) {
        return [user1, user2].sort().join(':');
    }

    private generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}