import { WebSocket } from "ws"
import { CHAT, GUESS, INIT_GAME } from "./messages";
import { Game } from "./Game";

export class GameManager {
    private games: Game[];
    private pendingUsers: WebSocket[];
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUsers = [];
        this.users = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
        //reconnect logic for game
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());

            if(message.type === INIT_GAME){
                if(this.pendingUsers.length >= 3){
                    const game = new Game(this.pendingUsers)
                    this.games.push(game);
                    this.pendingUsers = this.pendingUsers.slice(6);
                } else {
                    this.pendingUsers.push(socket);
                    socket.send(JSON.stringify({
                        type: "waiting",
                        playersFound: this.pendingUsers.length
                    }))
                }
            }

            if(message.type === CHAT){
                const game = this.games.find(game => game.players.includes(socket));
                if(game){
                    game.chatMessage(socket, message.chat);
                }
            }

            if(message.type === GUESS){
                const game = this.games.find(game => game.players.includes(socket));
                if(game) {
                    game.guessHandler(socket, message.guess);
                }
            }
        })
    }
}