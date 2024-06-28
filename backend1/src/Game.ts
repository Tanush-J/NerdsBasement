import { CARD_STORE, Card } from "./Dataset";
import { WebSocket } from "ws";
import { CHAT_BROADCAST, GUESS_RESPONSE, INIT_GAME } from "./messages";

interface ChatMessage {
    id: Number,
    player: WebSocket,
    message: String
}

interface Guess {
    id: Number,
    player: WebSocket,
    guess: String,
}

export class Game {
    public players: WebSocket[];
    public currentCard: Card;
    public chatHistory: ChatMessage[];
    public chameleon: WebSocket | null;
    public isStarted: boolean;
    private guesses: Guess[];
    private startTime: Date;

    constructor(players: WebSocket[]) {
        const chameleonIndex = Math.floor(Math.random() * players.length);
        const cardIndex = Math.floor(Math.random() * CARD_STORE.length);
        const wordIndex = Math.floor(Math.random() * CARD_STORE[cardIndex].wordList.length);

        this.players = players;
        this.chameleon = this.players[chameleonIndex];
        this.currentCard = CARD_STORE[cardIndex];
        this.chatHistory = [];
        this.guesses = [];
        this.isStarted = true;
        this.startTime = new Date();
        this.players.forEach((player, index) => {
            const Payload = {
                currentCard: this.currentCard,
                wordIndex: (index === chameleonIndex? -1 :wordIndex),
                isChameleon: index === chameleonIndex
            }
            player.send(JSON.stringify({
                type: INIT_GAME,
                payload: Payload
            }))
        })
    }

    chatMessage(socket: WebSocket, chat: String){
        const payload = {
            player: socket,
            message: chat
        }
        this.chatHistory.push({ id: this.chatHistory.length+1, player: socket, message: chat });
        this.broadcastHandler(CHAT_BROADCAST, payload);
    }

    guessHandler(socket: WebSocket, guess: string){ //need to refactor must guess should be a socket or playerId
        const remainingToGuess = this.players.length - this.guesses.length;
        const payload = { 
            playerGuessed: socket, 
            remainingToGuess
        }
        this.guesses.push({ id: this.guesses.length+1, player: socket, guess });
        this.broadcastHandler(GUESS_RESPONSE, payload);
    }

    private broadcastHandler(type: String, payload: Object){
        this.players.forEach(player => {
            player.send(JSON.stringify({
                type,
                payload
            }))
        })
    }
}