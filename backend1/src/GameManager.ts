import { WebSocket } from "ws"
import { CHAT, GUESS, INIT_GAME, PLAYER_INFO, WAITING } from "./messages";
import { Game } from "./Game";
import { User } from "./User";

export class GameManager {
    private games: Game[];
    private pendingUsers: User[];
    private users: User[];

    constructor() {
        this.games = [];
        this.pendingUsers = [];
        this.users = [];
    }

    addUser(socket: WebSocket, name: string) {
        const randomId = Math.round(Math.random()*10000)
        const user: User = new User(randomId, name, socket);
        this.users.push(user);
        this.addHandler(user);
        socket.send(JSON.stringify({ type: PLAYER_INFO, playerId: randomId }));
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user.socket !== socket);
        //reconnect logic for game
    }

    private addHandler(user: User) {
        user.socket.on('message', (data) => {
            const message = JSON.parse(data.toString());

            if(message.type === INIT_GAME){
                if(this.pendingUsers.length >= 3){
                    const game = new Game(this.pendingUsers)
                    this.games.push(game);
                    this.pendingUsers = this.pendingUsers.slice(6);
                } else {
                    this.pendingUsers.push(user);
                    user.socket.send(JSON.stringify({
                        type: WAITING,
                        playersFound: this.pendingUsers.length
                    }))
                }
            }

            if(message.type === CHAT){
                const game = this.games.find(game => 
                    game.players.some(player => player.getId() === user.getId())
                );
                if(game){
                    game.chatMessage(user, message?.chat);
                }
            }

            if(message.type === GUESS){
                const game = this.games.find(game => 
                    game.players.some(player => player.getId() === user.getId())
                );
                if(game) {
                    game.guessHandler(user, message?.guess);
                }
            }
        })
    }
}