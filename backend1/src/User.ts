import { WebSocket } from "ws";

export class User {
    private id: number;
    private name: string;
    public socket: WebSocket;

    constructor(id: number, name: string, socket: WebSocket) {
        this.id = id;
        this.name = name;
        this.socket = socket;
    }

    public getName = () => {
        return this.name;
    }

    public getId = () => {
        return this.id;
    }
}