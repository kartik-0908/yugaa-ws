import { UserManager } from "./UserManager";
import { createClient } from "redis";
import { PubSub, Subscription } from "@google-cloud/pubsub";

export class NotificationManager {
    private static instance: NotificationManager;
    private subscriptions: Map<string, Set<string>> = new Map();
    private pubSubClient: PubSub;
    private subscription: Subscription;

    private constructor() {
        this.pubSubClient = new PubSub({
            projectId: process.env.PROJECT_ID,
            credentials: {
                client_email: process.env.CLIENT_EMAIL,
                private_key: process.env.PRIVATE_KEY,
            },
        });
        this.subscription = this.pubSubClient.subscription(process.env.SUBSCRIPTION_NAME || "");
        this.connect();
    }

    private async connect() {
        this.subscription.on("message", this.handleNotification.bind(this));
        this.subscription.on("error", (error) => {
            console.error("Error occured in subscription", error);
        });
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationManager();
        }
        return this.instance;
    }

    public subscribe(userId: string, topics: string[]) {
        console.log("inside subscribe", userId, topics);
        topics.forEach(topic => {
            console.log("subscribing topic", topic);
            if (!this.subscriptions.has(topic)) {
                this.subscriptions.set(topic, new Set());
            }
            this.subscriptions.get(topic)?.add(userId);
        });
    }
    public unsubscribe(userId: string, topics: string[]) {
        topics.forEach(topic => {
            this.subscriptions.get(topic)?.delete(userId);
        });
    }

    public userLeft(userId: string) {
        this.subscriptions.forEach((subscribers) => {
            subscribers.delete(userId);
        });
    }

    private async handleNotification(message: any) {
        try {
            console.log("inside handleNotification", message.data.toString());
            const { topic, payload } = JSON.parse(message.data.toString());
            console.log("topic", topic);
            console.log("payload", payload);
            await this.sendNotification(topic, payload);
            message.ack();
        } catch (error) {
            console.error("Error occured while handling notification", error);
            message.nack();
        }
    }

    private async sendNotification(topic: string, message: any) {
        const subscribers = this.subscriptions.get(topic);
        subscribers?.forEach(userId => {
            UserManager.getInstance().getUser(userId)?.emit({ data: message });
        });
    }

}