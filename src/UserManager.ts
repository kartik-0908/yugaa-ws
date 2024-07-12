import { WebSocket } from "ws";
import { User } from "./User";
import { NotificationManager } from "./NotificationManager";

export class UserManager {
    private static instance: UserManager;
    private users: Map<string, User> = new Map();

    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserManager();
        }
        return this.instance;
    }

    public addUser(ws: WebSocket, userId: string, userRole: string, shopDomain: string) {
        console.log("inside addUser", userId, userRole, shopDomain);
        const user = new User(userId, ws);
        // console.log("user", user);
        this.users.set(userId, user);
        this.registerOnClose(ws, userId);
        return user;
    }

    private registerOnClose(ws: WebSocket, userId: string) {
        ws.on("close", () => {
            console.log("inside closing User disconnected");
            this.users.delete(userId);
            NotificationManager.getInstance().userLeft(userId);
        });
    }

    public getUser(userId: string) {
        return this.users.get(userId);
    }

    public removeUser(userId: string) {
        this.users.delete(userId);
    }
}
