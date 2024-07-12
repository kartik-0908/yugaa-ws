require('dotenv').config()
import { WebSocketServer } from "ws";
import url from 'url';
import { extractUserId, getUserRoleAndDomain } from "./auth";
import { UserManager } from "./UserManager";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", async (ws, req) => {
    //@ts-ignore
    const params = url.parse(req.url!, true).query;
    const id: string = params.id as string;
    const connectionId: string = params.connectionId as string;
    console.log(`New connection: User ID ${id}, Connection ID ${connectionId}`);
    try {
        const { role, shopDomain } = await getUserRoleAndDomain(id);
        console.log(role, shopDomain);
        const user = UserManager.getInstance().addUser(ws, id, role, shopDomain);
    } catch (error) {
        console.log(error);
    }
});

