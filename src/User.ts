import { WebSocket } from "ws";
import { SUBSCRIBE, UNSUBSCRIBE } from "./types/in";
import { NotificationManager } from "./NotificationManager";

export class User {
    private userId: string;
    private ws: WebSocket;

    constructor(userId: string, ws: WebSocket) {
        this.userId = userId;
        this.ws = ws;
        this.addListeners();
    }

    emit(message: any) {
        this.ws.send(JSON.stringify(message));
    }

    private addListeners() {
        console.log("inside addListeners");
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data as string);
            switch (message.method) {
                case SUBSCRIBE:
                    NotificationManager.getInstance().subscribe(this.userId, message.params);
                    break;
                case UNSUBSCRIBE:
                    NotificationManager.getInstance().unsubscribe(this.userId, message.params);
                    break;
            }
        }
    }
    
    cleanUp() {
        NotificationManager.getInstance().userLeft(this.userId);
        this.ws.removeAllListeners();
    }
}